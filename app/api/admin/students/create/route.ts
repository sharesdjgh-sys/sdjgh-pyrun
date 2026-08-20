import { NextRequest, NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/api-guard";
import { sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { users } from "@/lib/db/schema";
import { canImportStudents } from "@/lib/roles";
import { parseSchoolStudentNumber } from "@/lib/student-number";

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canImportStudents(context.role)) {
    return NextResponse.json({ error: "교사 또는 관리자 권한이 필요합니다." }, { status: 403 });
  }

  const rate = rateLimit(req, `student-create:${context.userId}`, 30, 10 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "학생 등록 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  const body = await req.json().catch(() => null);
  const studentNumber = typeof body?.studentNumber === "string" ? body.studentNumber.trim() : "";
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const classInfo = parseSchoolStudentNumber(studentNumber);

  if (!classInfo) {
    return NextResponse.json({ error: "학번은 10501과 같은 5자리 형식으로 입력해 주세요." }, { status: 400 });
  }
  if (!name || name.length > 100) {
    return NextResponse.json({ error: "학생 이름은 1~100자로 입력해 주세요." }, { status: 400 });
  }
  if (password.length < 8 || password.length > 128) {
    return NextResponse.json({ error: "초기 비밀번호는 8~128자로 입력해 주세요." }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(
      eq(users.schoolId, context.schoolId),
      or(eq(users.username, studentNumber), eq(users.studentNumber, studentNumber))
    ))
    .limit(1);

  if (existing) {
    return NextResponse.json({ error: "이미 등록된 학번입니다. 정보 갱신은 CSV 일괄 등록을 이용해 주세요." }, { status: 409 });
  }

  const bcrypt = await import("bcryptjs");
  const [student] = await db
    .insert(users)
    .values({
      schoolId: context.schoolId,
      username: studentNumber,
      passwordHash: await bcrypt.hash(password, 10),
      role: "student",
      displayName: name,
      nickname: "코드러너",
      studentNumber,
      grade: classInfo.grade,
      classNumber: classInfo.classNumber,
      seatNumber: classInfo.seatNumber,
    })
    .returning({ id: users.id, studentNumber: users.studentNumber, displayName: users.displayName });

  return NextResponse.json({ ok: true, student }, { status: 201 });
}
