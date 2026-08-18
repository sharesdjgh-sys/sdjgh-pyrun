import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { classCurriculumAssignments, teacherClassAssignments, users } from "@/lib/db/schema";
import { isAdministratorRole } from "@/lib/roles";

export async function POST(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const grade = Number(body?.grade);
  const classNumber = Number(body?.classNumber);
  if (!Number.isInteger(grade) || grade < 1 || grade > 12 || !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 99) {
    return NextResponse.json({ error: "학년과 반을 올바르게 입력해주세요." }, { status: 400 });
  }
  if (!isAdministratorRole(context.role)) {
    const [scope] = await db
      .select({ id: teacherClassAssignments.id })
      .from(teacherClassAssignments)
      .where(and(
        eq(teacherClassAssignments.teacherUserId, context.userId),
        eq(teacherClassAssignments.grade, grade),
        eq(teacherClassAssignments.classNumber, classNumber)
      ))
      .limit(1);
    if (!scope) return NextResponse.json({ error: "담당 학급에만 배정할 수 있습니다." }, { status: 403 });
  }
  const [assignment] = await db
    .insert(classCurriculumAssignments)
    .values({
      schoolId: context.schoolId,
      grade,
      classNumber,
      curriculumId,
      assignedByUserId: context.userId,
      assignedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        classCurriculumAssignments.schoolId,
        classCurriculumAssignments.grade,
        classCurriculumAssignments.classNumber,
      ],
      set: { curriculumId, assignedByUserId: context.userId, assignedAt: new Date() },
    })
    .returning();
  return NextResponse.json({ assignment });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const requestedClasses: Array<{ grade?: unknown; classNumber?: unknown }> | null = Array.isArray(body?.classes)
    ? body.classes
    : null;
  if (!requestedClasses || requestedClasses.length > 200) {
    return NextResponse.json({ error: "담당 학급을 올바르게 선택해주세요." }, { status: 400 });
  }
  const classes = requestedClasses.map((item) => ({
    grade: Number(item.grade),
    classNumber: Number(item.classNumber),
  }));
  if (classes.some((item) =>
    !Number.isInteger(item.grade) || item.grade < 1 || item.grade > 12 ||
    !Number.isInteger(item.classNumber) || item.classNumber < 1 || item.classNumber > 99
  )) {
    return NextResponse.json({ error: "학년과 반을 올바르게 선택해주세요." }, { status: 400 });
  }
  const uniqueClasses = classes.filter((item, index, items) => items.findIndex((candidate) =>
    candidate.grade === item.grade && candidate.classNumber === item.classNumber
  ) === index);

  const scopeRows = isAdministratorRole(context.role)
    ? await db
        .select({ grade: teacherClassAssignments.grade, classNumber: teacherClassAssignments.classNumber })
        .from(teacherClassAssignments)
        .innerJoin(users, eq(teacherClassAssignments.teacherUserId, users.id))
        .where(eq(users.schoolId, context.schoolId))
    : await db
        .select({ grade: teacherClassAssignments.grade, classNumber: teacherClassAssignments.classNumber })
        .from(teacherClassAssignments)
        .where(eq(teacherClassAssignments.teacherUserId, context.userId));
  const scopeKeys = new Set(scopeRows.map((item) => `${item.grade}:${item.classNumber}`));
  if (uniqueClasses.some((item) => !scopeKeys.has(`${item.grade}:${item.classNumber}`))) {
    return NextResponse.json({ error: "담당 학급에만 배정할 수 있습니다." }, { status: 403 });
  }

  const currentAssignments = await db
    .select({
      id: classCurriculumAssignments.id,
      grade: classCurriculumAssignments.grade,
      classNumber: classCurriculumAssignments.classNumber,
    })
    .from(classCurriculumAssignments)
    .where(and(
      eq(classCurriculumAssignments.schoolId, context.schoolId),
      eq(classCurriculumAssignments.curriculumId, curriculumId)
    ));
  const desiredKeys = new Set(uniqueClasses.map((item) => `${item.grade}:${item.classNumber}`));
  const removalIds = currentAssignments
    .filter((item) => scopeKeys.has(`${item.grade}:${item.classNumber}`) && !desiredKeys.has(`${item.grade}:${item.classNumber}`))
    .map((item) => item.id);

  for (const item of uniqueClasses) {
    await db
      .insert(classCurriculumAssignments)
      .values({
        schoolId: context.schoolId,
        grade: item.grade,
        classNumber: item.classNumber,
        curriculumId,
        assignedByUserId: context.userId,
        assignedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          classCurriculumAssignments.schoolId,
          classCurriculumAssignments.grade,
          classCurriculumAssignments.classNumber,
        ],
        set: { curriculumId, assignedByUserId: context.userId, assignedAt: new Date() },
      });
  }
  if (removalIds.length > 0) {
    await db.delete(classCurriculumAssignments).where(inArray(classCurriculumAssignments.id, removalIds));
  }

  const assignments = await db
    .select({ grade: classCurriculumAssignments.grade, classNumber: classCurriculumAssignments.classNumber })
    .from(classCurriculumAssignments)
    .where(and(
      eq(classCurriculumAssignments.schoolId, context.schoolId),
      eq(classCurriculumAssignments.curriculumId, curriculumId)
    ));
  return NextResponse.json({ assignments });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const grade = Number(body?.grade);
  const classNumber = Number(body?.classNumber);
  if (!Number.isInteger(grade) || grade < 1 || grade > 12 || !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 99) {
    return NextResponse.json({ error: "학년과 반을 올바르게 선택해주세요." }, { status: 400 });
  }

  if (!isAdministratorRole(context.role)) {
    const [scope] = await db
      .select({ id: teacherClassAssignments.id })
      .from(teacherClassAssignments)
      .where(and(
        eq(teacherClassAssignments.teacherUserId, context.userId),
        eq(teacherClassAssignments.grade, grade),
        eq(teacherClassAssignments.classNumber, classNumber)
      ))
      .limit(1);
    if (!scope) return NextResponse.json({ error: "담당 학급의 배정만 취소할 수 있습니다." }, { status: 403 });
  }

  const [deleted] = await db
    .delete(classCurriculumAssignments)
    .where(and(
      eq(classCurriculumAssignments.schoolId, context.schoolId),
      eq(classCurriculumAssignments.curriculumId, curriculumId),
      eq(classCurriculumAssignments.grade, grade),
      eq(classCurriculumAssignments.classNumber, classNumber)
    ))
    .returning({ id: classCurriculumAssignments.id });

  if (!deleted) {
    return NextResponse.json({ error: "취소할 학급 배정을 찾을 수 없습니다." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
