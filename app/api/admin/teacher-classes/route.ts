import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { teacherClassAssignments, users } from "@/lib/db/schema";
import { sessionTenant } from "@/lib/curriculum-access";
import { isAdministratorRole } from "@/lib/roles";
import { asc, eq, inArray } from "drizzle-orm";

async function requireAdministrator() {
  const context = sessionTenant(await auth());
  if (!context) {
    return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }

  if (!isAdministratorRole(context.role)) {
    return { denied: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
  }

  return context;
}

export async function GET(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;
  const schoolId = Number(req.nextUrl.searchParams.get("schoolId"));
  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return NextResponse.json({ error: "관리할 학교를 선택해 주세요." }, { status: 400 });
  }

  const assignments = await db
    .select({
      id: teacherClassAssignments.id,
      teacherUserId: teacherClassAssignments.teacherUserId,
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    })
    .from(teacherClassAssignments)
    .innerJoin(users, eq(teacherClassAssignments.teacherUserId, users.id))
    .where(eq(users.schoolId, schoolId))
    .orderBy(asc(teacherClassAssignments.grade), asc(teacherClassAssignments.classNumber));

  return NextResponse.json({ assignments });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const teacherUserId = Number(body?.teacherUserId);
  const grade = Number(body?.grade);
  const classNumber = Number(body?.classNumber);

  if (!Number.isInteger(teacherUserId) || teacherUserId <= 0 || !Number.isInteger(grade) || grade < 1 || grade > 12 || !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 99) {
    return NextResponse.json({ error: "교사와 학년·반을 올바르게 입력해주세요." }, { status: 400 });
  }

  const [teacher] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, teacherUserId))
    .limit(1);
  if (!teacher || teacher.role !== "teacher") {
    return NextResponse.json({ error: "교사 계정을 찾을 수 없습니다." }, { status: 404 });
  }

  const [assignment] = await db
    .insert(teacherClassAssignments)
    .values({ teacherUserId, grade, classNumber })
    .onConflictDoNothing()
    .returning({
      id: teacherClassAssignments.id,
      teacherUserId: teacherClassAssignments.teacherUserId,
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    });

  if (!assignment) {
    return NextResponse.json({ error: "이미 배정된 학급입니다." }, { status: 409 });
  }

  return NextResponse.json({ assignment });
}

export async function PUT(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const teacherUserId = Number(body?.teacherUserId);
  const requestedClasses: Array<{ grade?: unknown; classNumber?: unknown }> | null = Array.isArray(body?.classes)
    ? body.classes
    : null;
  if (!Number.isInteger(teacherUserId) || teacherUserId <= 0 || !requestedClasses || requestedClasses.length > 200) {
    return NextResponse.json({ error: "교사와 담당 학급을 올바르게 선택해주세요." }, { status: 400 });
  }

  const classes = requestedClasses.map((item) => ({
    grade: Number(item?.grade),
    classNumber: Number(item?.classNumber),
  }));
  if (classes.some((item) =>
    !Number.isInteger(item.grade) || item.grade < 1 || item.grade > 12 ||
    !Number.isInteger(item.classNumber) || item.classNumber < 1 || item.classNumber > 99
  )) {
    return NextResponse.json({ error: "학년과 반을 올바르게 선택해주세요." }, { status: 400 });
  }

  const uniqueClasses = classes.filter((item, index, items) =>
    items.findIndex((candidate) => candidate.grade === item.grade && candidate.classNumber === item.classNumber) === index
  );
  const [teacher] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, teacherUserId))
    .limit(1);
  if (!teacher || teacher.role !== "teacher") {
    return NextResponse.json({ error: "교사 계정을 찾을 수 없습니다." }, { status: 404 });
  }

  const existing = await db
    .select({
      id: teacherClassAssignments.id,
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    })
    .from(teacherClassAssignments)
    .where(eq(teacherClassAssignments.teacherUserId, teacherUserId));
  const desiredKeys = new Set(uniqueClasses.map((item) => `${item.grade}:${item.classNumber}`));
  const existingKeys = new Set(existing.map((item) => `${item.grade}:${item.classNumber}`));
  const removalIds = existing.filter((item) => !desiredKeys.has(`${item.grade}:${item.classNumber}`)).map((item) => item.id);
  const additions = uniqueClasses.filter((item) => !existingKeys.has(`${item.grade}:${item.classNumber}`));

  if (additions.length > 0) {
    await db.insert(teacherClassAssignments).values(additions.map((item) => ({ teacherUserId, ...item }))).onConflictDoNothing();
  }
  if (removalIds.length > 0) {
    await db.delete(teacherClassAssignments).where(inArray(teacherClassAssignments.id, removalIds));
  }

  const assignments = await db
    .select({
      id: teacherClassAssignments.id,
      teacherUserId: teacherClassAssignments.teacherUserId,
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    })
    .from(teacherClassAssignments)
    .where(eq(teacherClassAssignments.teacherUserId, teacherUserId))
    .orderBy(asc(teacherClassAssignments.grade), asc(teacherClassAssignments.classNumber));

  return NextResponse.json({ assignments });
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const assignmentId = Number(body?.assignmentId);
  if (!Number.isInteger(assignmentId) || assignmentId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 학급 배정입니다." }, { status: 400 });
  }

  const [ownedAssignment] = await db
    .select({ id: teacherClassAssignments.id })
    .from(teacherClassAssignments)
    .innerJoin(users, eq(teacherClassAssignments.teacherUserId, users.id))
    .where(eq(teacherClassAssignments.id, assignmentId))
    .limit(1);

  if (!ownedAssignment) {
    return NextResponse.json({ error: "학급 배정을 찾을 수 없습니다." }, { status: 404 });
  }

  const [deleted] = await db
    .delete(teacherClassAssignments)
    .where(eq(teacherClassAssignments.id, ownedAssignment.id))
    .returning({ id: teacherClassAssignments.id });

  if (!deleted) return NextResponse.json({ error: "학급 배정을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true, assignmentId });
}
