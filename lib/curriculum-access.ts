import { and, asc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db/index";
import {
  badges,
  classCurriculumAssignments,
  concepts,
  curriculumSets,
  users,
} from "@/lib/db/schema";
import { isAdministratorRole, isStudentRole } from "@/lib/roles";
import { curriculumLevelOrders } from "@/lib/curriculum-model";

export type SessionTenant = {
  userId: number;
  schoolId: number;
  role: string;
};

export function sessionTenant(
  session: { user?: { id?: string | null; schoolId?: number; role?: string } } | null | undefined
): SessionTenant | null {
  const userId = Number(session?.user?.id);
  const schoolId = Number(session?.user?.schoolId);
  const role = session?.user?.role;
  if (!Number.isInteger(userId) || userId <= 0 || !Number.isInteger(schoolId) || schoolId <= 0 || !role) {
    return null;
  }
  return { userId, schoolId, role };
}

export async function resolveCurriculumIdForUser(context: SessionTenant): Promise<number | null> {
  if (isStudentRole(context.role)) {
    const [student] = await db
      .select({ grade: users.grade, classNumber: users.classNumber })
      .from(users)
      .where(and(eq(users.id, context.userId), eq(users.schoolId, context.schoolId)))
      .limit(1);

    if (student && student.grade !== null && student.classNumber !== null) {
      const [assignment] = await db
        .select({ curriculumId: classCurriculumAssignments.curriculumId })
        .from(classCurriculumAssignments)
        .innerJoin(curriculumSets, eq(classCurriculumAssignments.curriculumId, curriculumSets.id))
        .where(and(
          eq(classCurriculumAssignments.schoolId, context.schoolId),
          eq(classCurriculumAssignments.grade, student.grade),
          eq(classCurriculumAssignments.classNumber, student.classNumber),
          eq(curriculumSets.schoolId, context.schoolId)
        ))
        .limit(1);
      if (assignment) return assignment.curriculumId;
    }
  }

  const [fallback] = await db
    .select({ id: curriculumSets.id })
    .from(curriculumSets)
    .where(and(eq(curriculumSets.schoolId, context.schoolId), eq(curriculumSets.isDefault, true)))
    .orderBy(asc(curriculumSets.id))
    .limit(1);
  return fallback?.id ?? null;
}

export async function canManageCurriculum(context: SessionTenant, curriculumId: number): Promise<boolean> {
  const ownership = isAdministratorRole(context.role)
    ? eq(curriculumSets.schoolId, context.schoolId)
    : and(
        eq(curriculumSets.schoolId, context.schoolId),
        eq(curriculumSets.ownerTeacherId, context.userId)
      );
  const [row] = await db
    .select({ id: curriculumSets.id })
    .from(curriculumSets)
    .where(and(eq(curriculumSets.id, curriculumId), ownership))
    .limit(1);
  return Boolean(row);
}

export async function canReadCurriculum(context: SessionTenant, curriculumId: number): Promise<boolean> {
  if (isAdministratorRole(context.role)) {
    const [row] = await db
      .select({ id: curriculumSets.id })
      .from(curriculumSets)
      .where(and(eq(curriculumSets.id, curriculumId), eq(curriculumSets.schoolId, context.schoolId)))
      .limit(1);
    return Boolean(row);
  }

  const resolved = await resolveCurriculumIdForUser(context);
  if (resolved === curriculumId) return true;

  if (!isStudentRole(context.role)) {
    const [row] = await db
      .select({ id: curriculumSets.id })
      .from(curriculumSets)
      .where(and(
        eq(curriculumSets.id, curriculumId),
        eq(curriculumSets.schoolId, context.schoolId),
        or(eq(curriculumSets.ownerTeacherId, context.userId), isNull(curriculumSets.ownerTeacherId))
      ))
      .limit(1);
    return Boolean(row);
  }
  return false;
}

export async function getCurriculumUnits(curriculumId: number, includeInactive = false) {
  return db
    .select({
      id: concepts.id,
      curriculumId: concepts.curriculumId,
      sourceConceptId: concepts.sourceConceptId,
      nameKo: concepts.nameKo,
      nameEn: concepts.nameEn,
      groupName: concepts.groupName,
      orderIndex: concepts.orderIndex,
      description: concepts.description,
      level: concepts.level,
      exampleCode: concepts.exampleCode,
      practiceCode: concepts.practiceCode,
      isActive: concepts.isActive,
      badgeId: badges.id,
      badgeNameKo: badges.nameKo,
      iconName: badges.iconName,
      colorClass: badges.colorClass,
    })
    .from(concepts)
    .leftJoin(badges, eq(badges.conceptId, concepts.id))
    .where(includeInactive
      ? eq(concepts.curriculumId, curriculumId)
      : and(eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true)))
    .orderBy(asc(concepts.level), asc(concepts.orderIndex), asc(concepts.id));
}

export function curriculumOrders(
  units: Array<{
    id: number;
    sourceConceptId?: number | null;
    level: number;
    groupName?: string | null;
    orderIndex: number;
  }>,
): number[][] {
  return curriculumLevelOrders(units);
}
