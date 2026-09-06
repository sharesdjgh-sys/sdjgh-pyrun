import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, inArray, isNull, or } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { badges, classCurriculumAssignments, concepts, curriculumSets, mechdogUnits, teacherClassAssignments, users } from "@/lib/db/schema";
import { getCurriculumUnits, sessionTenant } from "@/lib/curriculum-access";
import { ensureDefaultMechdogUnits, getMechdogUnits } from "@/lib/mechdog-access";
import { canOpenAdminPage, isAdministratorRole } from "@/lib/roles";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context || !canOpenAdminPage(context.role)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const ownerScope = isAdministratorRole(context.role)
    ? eq(curriculumSets.schoolId, context.schoolId)
    : and(
        eq(curriculumSets.schoolId, context.schoolId),
        or(eq(curriculumSets.ownerTeacherId, context.userId), isNull(curriculumSets.ownerTeacherId))
      );
  const rows = await db
    .select()
    .from(curriculumSets)
    .where(ownerScope)
    .orderBy(asc(curriculumSets.isDefault), asc(curriculumSets.createdAt));
  const assignments = rows.length > 0
    ? await db
        .select({
          curriculumId: classCurriculumAssignments.curriculumId,
          grade: classCurriculumAssignments.grade,
          classNumber: classCurriculumAssignments.classNumber,
        })
        .from(classCurriculumAssignments)
        .where(and(
          eq(classCurriculumAssignments.schoolId, context.schoolId),
          inArray(classCurriculumAssignments.curriculumId, rows.map((row) => row.id))
        ))
        .orderBy(asc(classCurriculumAssignments.grade), asc(classCurriculumAssignments.classNumber))
    : [];
  const assignableClassRows = await db
    .select({
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    })
    .from(teacherClassAssignments)
    .innerJoin(users, eq(teacherClassAssignments.teacherUserId, users.id))
    .where(isAdministratorRole(context.role)
      ? eq(users.schoolId, context.schoolId)
      : and(
          eq(users.schoolId, context.schoolId),
          eq(teacherClassAssignments.teacherUserId, context.userId)
        ))
    .orderBy(asc(teacherClassAssignments.grade), asc(teacherClassAssignments.classNumber));
  const assignableClasses = assignableClassRows.filter((item, index, items) =>
    items.findIndex((candidate) =>
      candidate.grade === item.grade && candidate.classNumber === item.classNumber
    ) === index
  );

  return NextResponse.json({
    curricula: rows.map((row) => ({
      ...row,
      canEdit: isAdministratorRole(context.role) || row.ownerTeacherId === context.userId,
      assignments: assignments
        .filter((item) => item.curriculumId === row.id)
        .map(({ grade, classNumber }) => ({ grade, classNumber })),
    })),
    assignableClasses,
  });
}

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context || !canOpenAdminPage(context.role)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 500) : "";
  const cloneFromId = Number(body?.cloneFromId);
  if (!name) return NextResponse.json({ error: "커리큘럼 이름을 입력해주세요." }, { status: 400 });

  let sourceUnits: Awaited<ReturnType<typeof getCurriculumUnits>> = [];
  let sourceMechdogUnits: Awaited<ReturnType<typeof getMechdogUnits>> = [];
  if (Number.isInteger(cloneFromId) && cloneFromId > 0) {
    const [source] = await db
      .select({ id: curriculumSets.id })
      .from(curriculumSets)
      .where(and(eq(curriculumSets.id, cloneFromId), eq(curriculumSets.schoolId, context.schoolId)))
      .limit(1);
    if (!source) return NextResponse.json({ error: "복제할 커리큘럼을 찾을 수 없습니다." }, { status: 404 });
    await ensureDefaultMechdogUnits(source.id, context.userId);
    [sourceUnits, sourceMechdogUnits] = await Promise.all([
      getCurriculumUnits(source.id),
      getMechdogUnits(source.id, true),
    ]);
  }

  const [created] = await db
    .insert(curriculumSets)
    .values({
      schoolId: context.schoolId,
      ownerTeacherId: context.userId,
      name,
      description: description || null,
    })
    .returning();

  try {
    for (const source of sourceUnits) {
      const [unit] = await db
        .insert(concepts)
        .values({
          curriculumId: created.id,
          sourceConceptId: source.sourceConceptId ?? source.id,
          createdByUserId: context.userId,
          nameKo: source.nameKo,
          nameEn: source.nameEn,
          groupName: source.groupName,
          orderIndex: source.orderIndex,
          description: source.description,
          level: source.level,
          exampleCode: source.exampleCode,
          practiceCode: source.practiceCode,
        })
        .returning({ id: concepts.id });
      await db.insert(badges).values({
        conceptId: unit.id,
        nameKo: source.badgeNameKo ?? `${source.nameKo} 완료`,
        iconName: source.iconName ?? "Award",
        colorClass: source.colorClass ?? "text-purple-500",
      });
    }
    if (sourceMechdogUnits.length > 0) {
      await db.insert(mechdogUnits).values(sourceMechdogUnits.map((source) => ({
        curriculumId: created.id,
        createdByUserId: context.userId,
        nameKo: source.nameKo,
        nameEn: source.nameEn,
        groupName: source.groupName,
        orderIndex: source.orderIndex,
        description: source.description,
        exampleCode: source.exampleCode,
        isActive: source.isActive,
      })));
    }
    await ensureDefaultMechdogUnits(created.id, context.userId);
  } catch (error) {
    await db.delete(curriculumSets).where(eq(curriculumSets.id, created.id));
    throw error;
  }

  return NextResponse.json({ curriculum: created }, { status: 201 });
}
