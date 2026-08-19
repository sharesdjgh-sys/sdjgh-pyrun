import { and, eq, inArray, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { classCurriculumAssignments, teacherClassAssignments, users } from "@/lib/db/schema";

type ClassCoordinate = {
  grade: number;
  classNumber: number;
};

const classKey = ({ grade, classNumber }: ClassCoordinate) => `${grade}:${classNumber}`;

export async function cleanupEmptyClassAssignments(schoolId: number, onlyClass?: ClassCoordinate) {
  const studentClasses = await db
    .selectDistinct({ grade: users.grade, classNumber: users.classNumber })
    .from(users)
    .where(and(
      eq(users.schoolId, schoolId),
      eq(users.role, "student"),
      isNotNull(users.grade),
      isNotNull(users.classNumber)
    ));
  const occupiedKeys = new Set(studentClasses.flatMap((item) =>
    item.grade === null || item.classNumber === null
      ? []
      : [`${item.grade}:${item.classNumber}`]
  ));

  const teacherAssignments = await db
    .select({
      id: teacherClassAssignments.id,
      grade: teacherClassAssignments.grade,
      classNumber: teacherClassAssignments.classNumber,
    })
    .from(teacherClassAssignments)
    .innerJoin(users, eq(teacherClassAssignments.teacherUserId, users.id))
    .where(eq(users.schoolId, schoolId));
  const curriculumAssignments = await db
    .select({
      id: classCurriculumAssignments.id,
      grade: classCurriculumAssignments.grade,
      classNumber: classCurriculumAssignments.classNumber,
    })
    .from(classCurriculumAssignments)
    .where(eq(classCurriculumAssignments.schoolId, schoolId));

  const candidateClasses = [...teacherAssignments, ...curriculumAssignments]
    .map(({ grade, classNumber }) => ({ grade, classNumber }))
    .filter((item, index, items) =>
      items.findIndex((candidate) => classKey(candidate) === classKey(item)) === index
    )
    .filter((item) => !onlyClass || classKey(item) === classKey(onlyClass));
  const emptyClasses = candidateClasses.filter((item) => !occupiedKeys.has(classKey(item)));
  const emptyKeys = new Set(emptyClasses.map(classKey));
  const teacherAssignmentIds = teacherAssignments
    .filter((item) => emptyKeys.has(classKey(item)))
    .map((item) => item.id);
  const curriculumAssignmentIds = curriculumAssignments
    .filter((item) => emptyKeys.has(classKey(item)))
    .map((item) => item.id);

  if (teacherAssignmentIds.length > 0) {
    await db.delete(teacherClassAssignments).where(inArray(teacherClassAssignments.id, teacherAssignmentIds));
  }
  if (curriculumAssignmentIds.length > 0) {
    await db.delete(classCurriculumAssignments).where(inArray(classCurriculumAssignments.id, curriculumAssignmentIds));
  }

  return {
    removedClasses: emptyClasses,
    teacherAssignmentCount: teacherAssignmentIds.length,
    curriculumAssignmentCount: curriculumAssignmentIds.length,
  };
}
