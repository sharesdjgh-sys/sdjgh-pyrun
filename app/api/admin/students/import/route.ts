import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { isAdministratorRole } from "@/lib/roles";
import { parseSchoolStudentNumber } from "@/lib/student-number";
import { eq, inArray, or } from "drizzle-orm";

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
  const session = await auth();
  const currentUserId = Number(session?.user?.id);
  if (!session || !Number.isInteger(currentUserId)) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const [currentUser] = await db.select({ role: users.role }).from(users).where(eq(users.id, currentUserId)).limit(1);
  if (!currentUser || !isAdministratorRole(currentUser.role)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
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
    .select({ id: users.id, username: users.username, studentNumber: users.studentNumber, role: users.role })
    .from(users)
    .where(or(inArray(users.username, studentNumbers), inArray(users.studentNumber, studentNumbers)));

  const conflictingStudent = existingUsers.find((user) => user.studentNumber && user.studentNumber !== user.username);
  if (conflictingStudent) {
    return NextResponse.json({ error: `학번 ${conflictingStudent.studentNumber}은(는) 다른 계정에서 사용 중입니다.` }, { status: 409 });
  }

  const nonStudentAccount = existingUsers.find((user) => studentNumbers.includes(user.username) && user.role !== "student");
  if (nonStudentAccount) {
    return NextResponse.json({ error: `학번 ${nonStudentAccount.username}은(는) 교사 또는 관리자 계정에서 사용 중입니다.` }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  let created = 0;
  let updated = 0;

  for (const student of parsedStudents) {
    const existing = existingUsers.find((user) => user.username === student.studentNumber);
    if (existing) {
      await db
        .update(users)
        .set({
          role: "student",
          displayName: student.name,
          studentNumber: student.studentNumber,
          grade: student.classInfo!.grade,
          classNumber: student.classInfo!.classNumber,
          seatNumber: student.classInfo!.seatNumber,
        })
        .where(eq(users.id, existing.id));
      updated += 1;
    } else {
      await db.insert(users).values({
        username: student.studentNumber,
        passwordHash: await bcrypt.hash(student.password, 10),
        role: "student",
        displayName: student.name,
        studentNumber: student.studentNumber,
        grade: student.classInfo!.grade,
        classNumber: student.classInfo!.classNumber,
        seatNumber: student.classInfo!.seatNumber,
      });
      created += 1;
    }
  }

  return NextResponse.json({ ok: true, created, updated, total: parsedStudents.length });
}
