import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { canImportStudents } from "@/lib/roles";
import { parseSchoolStudentNumber } from "@/lib/student-number";
import { and, eq, inArray, or } from "drizzle-orm";
import { sessionTenant } from "@/lib/curriculum-access";

const MAX_CSV_BYTES = 1_000_000;
const MAX_STUDENTS = 500;

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (char === '"') {
      if (quoted && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(field.trim());
      field = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizedHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim().toLowerCase().replace(/[\s-]/g, "_");
}

function findHeader(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.includes(header));
}

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!canImportStudents(context.role)) {
    return NextResponse.json({ error: "교사 또는 관리자 권한이 필요합니다." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0 || file.size > MAX_CSV_BYTES || !file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "1MB 이하의 CSV 파일을 선택해주세요." }, { status: 400 });
  }

  const rows = parseCsv(await file.text());
  if (rows.length < 2) return NextResponse.json({ error: "CSV에 학생 정보가 없습니다." }, { status: 400 });
  if (rows.length - 1 > MAX_STUDENTS) return NextResponse.json({ error: `한 번에 최대 ${MAX_STUDENTS}명까지 등록할 수 있습니다.` }, { status: 400 });

  const headers = rows[0].map(normalizedHeader);
  const columns = {
    studentNumber: findHeader(headers, ["학번", "student_number", "studentnumber"]),
    name: findHeader(headers, ["이름", "name", "display_name"]),
    password: findHeader(headers, ["비밀번호", "초기비밀번호", "password", "initial_password"]),
  };

  if (Object.values(columns).some((index) => index < 0)) {
    return NextResponse.json({ error: "CSV 열은 학번, 이름, 초기비밀번호가 필요합니다." }, { status: 400 });
  }

  const parsedStudents = rows.slice(1).map((row, index) => {
    const studentNumber = row[columns.studentNumber]?.trim() ?? "";
    const classInfo = parseSchoolStudentNumber(studentNumber);
    return {
      rowNumber: index + 2,
      studentNumber,
      name: row[columns.name]?.trim() ?? "",
      password: row[columns.password] ?? "",
      classInfo,
    };
  });

  for (const student of parsedStudents) {
    if (!student.classInfo || !student.name || student.name.length > 100 || student.password.length < 4 || student.password.length > 100) {
      return NextResponse.json({ error: `${student.rowNumber}행을 확인해주세요. 학번은 10501과 같은 5자리 형식이어야 합니다.` }, { status: 400 });
    }
  }

  const studentNumbers = parsedStudents.map((student) => student.studentNumber);
  if (new Set(studentNumbers).size !== studentNumbers.length) {
    return NextResponse.json({ error: "CSV에 중복된 학번이 있습니다." }, { status: 400 });
  }

  const existingUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.schoolId, context.schoolId),
      or(inArray(users.username, studentNumbers), inArray(users.studentNumber, studentNumbers))
    ));

  // 학번은 해가 바뀌면 다른 학생이 다시 쓴다. 기존 PK의 이름·학급을 CSV로
  // 덮어쓰면 그 PK에 남은 학습 기록의 소유자가 바뀌므로 전체 파일을 거부한다.
  if (existingUsers.length > 0) {
    return NextResponse.json({ error: "이미 등록된 학번이 있습니다. 기존 계정은 CSV로 갱신할 수 없습니다." }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  const newUsers = [];
  for (const student of parsedStudents) {
    newUsers.push({
      schoolId: context.schoolId,
      username: student.studentNumber,
      passwordHash: await bcrypt.hash(student.password, 10),
      role: "student" as const,
      displayName: student.name,
      nickname: "코드러너",
      studentNumber: student.studentNumber,
      grade: student.classInfo!.grade,
      classNumber: student.classInfo!.classNumber,
      seatNumber: student.classInfo!.seatNumber,
    });
  }

  // 한 SQL 문으로 삽입해 동시 등록과 충돌하면 일부 학생만 생성되지 않게 한다.
  try {
    await db.insert(users).values(newUsers);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "이미 등록된 학번이 있습니다. CSV 전체를 다시 확인해 주세요." }, { status: 409 });
    }
    throw error;
  }

  return NextResponse.json({ ok: true, created: newUsers.length, updated: 0, total: parsedStudents.length });
}
