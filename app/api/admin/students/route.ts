import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import {
  classCurriculumAssignments,
  concepts,
  curriculumSets,
  feedbackHistory,
  teacherClassAssignments,
  userConceptClears,
  userConceptPractices,
  userConceptUnlocks,
  users,
} from "@/lib/db/schema";
import {
  getCurriculumUnits,
  resolveCurriculumIdForUser,
  sessionTenant,
} from "@/lib/curriculum-access";
import { canManageStudentClass, canOpenAdminPage, isAdministratorRole } from "@/lib/roles";
import { parseSchoolStudentNumber } from "@/lib/student-number";
import { and, asc, eq, inArray, sql } from "drizzle-orm";

async function requireTeacher() {
  const context = sessionTenant(await auth());
  if (!context) {
    return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }

  if (!canOpenAdminPage(context.role)) {
    return { denied: NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 }) };
  }

  return context;
}

export async function GET() {
  const authResult = await requireTeacher();
  if ("denied" in authResult) return authResult.denied;

  try {
    const rawStudentRows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        studentNumber: users.studentNumber,
        grade: users.grade,
        classNumber: users.classNumber,
        seatNumber: users.seatNumber,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(and(eq(users.schoolId, authResult.schoolId), eq(users.role, "student")))
      .orderBy(asc(users.grade), asc(users.classNumber), asc(users.seatNumber), asc(users.id));

    const allStudentRows = rawStudentRows.map((student) => {
      const parsed = parseSchoolStudentNumber(student.studentNumber ?? student.username);
      return {
        ...student,
        grade: parsed?.grade ?? student.grade,
        classNumber: parsed?.classNumber ?? student.classNumber,
        seatNumber: parsed?.seatNumber ?? student.seatNumber,
      };
    });

    const assignedClasses = isAdministratorRole(authResult.role)
      ? []
      : await db
          .select({ grade: teacherClassAssignments.grade, classNumber: teacherClassAssignments.classNumber })
          .from(teacherClassAssignments)
          .where(eq(teacherClassAssignments.teacherUserId, authResult.userId))
          .orderBy(asc(teacherClassAssignments.grade), asc(teacherClassAssignments.classNumber));

    const studentRows = isAdministratorRole(authResult.role)
      ? allStudentRows
      : allStudentRows.filter((student) => canManageStudentClass(
          authResult.role,
          assignedClasses,
          student.grade,
          student.classNumber
        ));

    if (studentRows.length === 0) {
      return NextResponse.json({ students: [], assignedClasses, unrestricted: isAdministratorRole(authResult.role) });
    }

    const studentIds = studentRows.map((student) => student.id);
    const [clears, practices, manualUnlocks, activity, curriculumRows] = await Promise.all([
      db
        .select({ userId: userConceptClears.userId, conceptId: userConceptClears.conceptId })
        .from(userConceptClears)
        .where(inArray(userConceptClears.userId, studentIds)),
      db
        .select({ userId: userConceptPractices.userId, conceptId: userConceptPractices.conceptId })
        .from(userConceptPractices)
        .where(and(
          inArray(userConceptPractices.userId, studentIds),
          eq(userConceptPractices.practiceSource, "selected")
        )),
      db
        .select({ userId: userConceptUnlocks.userId, conceptId: userConceptUnlocks.conceptId })
        .from(userConceptUnlocks)
        .where(inArray(userConceptUnlocks.userId, studentIds)),
      db
        .select({
          userId: feedbackHistory.userId,
          submissionCount: sql<number>`count(*)::int`,
          successfulRunCount: sql<number>`count(*) filter (where ${feedbackHistory.isSuccess} = true)::int`,
          lastActivityAt: sql<Date | null>`max(${feedbackHistory.createdAt})`,
        })
        .from(feedbackHistory)
        .where(inArray(feedbackHistory.userId, studentIds))
        .groupBy(feedbackHistory.userId),
      db
        .select({
          id: curriculumSets.id,
          name: curriculumSets.name,
          isDefault: curriculumSets.isDefault,
          grade: classCurriculumAssignments.grade,
          classNumber: classCurriculumAssignments.classNumber,
        })
        .from(curriculumSets)
        .leftJoin(
          classCurriculumAssignments,
          and(
            eq(classCurriculumAssignments.curriculumId, curriculumSets.id),
            eq(classCurriculumAssignments.schoolId, authResult.schoolId)
          )
        )
        .where(eq(curriculumSets.schoolId, authResult.schoolId))
        .orderBy(asc(curriculumSets.id)),
    ]);

    const curriculumMap = new Map<number, {
      id: number;
      name: string;
      isDefault: boolean;
      assignments: Array<{ grade: number; classNumber: number }>;
    }>();
    for (const item of curriculumRows) {
      const relevantAssignment = item.grade !== null && item.classNumber !== null
        && studentRows.some((student) =>
          student.grade === item.grade && student.classNumber === item.classNumber
        );
      if (!item.isDefault && !relevantAssignment) continue;

      const definition = curriculumMap.get(item.id) ?? {
        id: item.id,
        name: item.name,
        isDefault: item.isDefault,
        assignments: [],
      };
      if (item.grade !== null && item.classNumber !== null) {
        definition.assignments.push({ grade: item.grade, classNumber: item.classNumber });
      }
      curriculumMap.set(item.id, definition);
    }
    const curriculumDefinitions = await Promise.all(
      [...curriculumMap.values()].map(async (item) => ({
        ...item,
        units: await getCurriculumUnits(item.id),
      }))
    );

    return NextResponse.json({
      students: studentRows.map((student) => {
        const studentActivity = activity.find((item) => item.userId === student.id);
        return {
          ...student,
          clearedConceptIds: clears.filter((item) => item.userId === student.id).map((item) => item.conceptId),
          practicedConceptIds: practices.filter((item) => item.userId === student.id).map((item) => item.conceptId),
          manuallyUnlockedConceptIds: manualUnlocks.filter((item) => item.userId === student.id).map((item) => item.conceptId),
          submissionCount: studentActivity?.submissionCount ?? 0,
          successfulRunCount: studentActivity?.successfulRunCount ?? 0,
          lastActivityAt: studentActivity?.lastActivityAt ?? null,
        };
      }),
      assignedClasses,
      unrestricted: isAdministratorRole(authResult.role),
      curricula: curriculumDefinitions,
    });
  } catch (error) {
    console.error("Student management API error", error);
    return NextResponse.json({ error: "학생 수업 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await requireTeacher();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const studentId = Number(body?.studentId);
  const conceptId = Number(body?.conceptId);

  if (!Number.isInteger(studentId) || studentId <= 0 || !Number.isInteger(conceptId) || conceptId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 학생 또는 단원입니다." }, { status: 400 });
  }

  const [student] = await db
    .select({
      id: users.id,
      role: users.role,
      username: users.username,
      studentNumber: users.studentNumber,
      grade: users.grade,
      classNumber: users.classNumber,
      schoolId: users.schoolId,
    })
    .from(users)
    .where(and(eq(users.id, studentId), eq(users.schoolId, authResult.schoolId)))
    .limit(1);

  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "학생 계정을 찾을 수 없습니다." }, { status: 404 });
  }
  const parsedClass = parseSchoolStudentNumber(student.studentNumber ?? student.username);
  const studentGrade = parsedClass?.grade ?? student.grade;
  const studentClassNumber = parsedClass?.classNumber ?? student.classNumber;

  if (!isAdministratorRole(authResult.role)) {
    const assignments = await db
      .select({ grade: teacherClassAssignments.grade, classNumber: teacherClassAssignments.classNumber })
      .from(teacherClassAssignments)
      .where(eq(teacherClassAssignments.teacherUserId, authResult.userId));

    if (!canManageStudentClass(authResult.role, assignments, studentGrade, studentClassNumber)) {
      return NextResponse.json({ error: "담당 학급의 학생만 관리할 수 있습니다." }, { status: 403 });
    }
  }

  const assignedCurriculumId = await resolveCurriculumIdForUser({
    userId: student.id,
    schoolId: student.schoolId,
    role: "student",
  });
  const [concept] = assignedCurriculumId
    ? await db
        .select({ id: concepts.id })
        .from(concepts)
        .where(and(
          eq(concepts.id, conceptId),
          eq(concepts.curriculumId, assignedCurriculumId),
          eq(concepts.isActive, true)
        ))
        .limit(1)
    : [];

  if (!concept) {
    return NextResponse.json({ error: "학생에게 배정된 커리큘럼의 단원이 아닙니다." }, { status: 400 });
  }

  await db
    .insert(userConceptUnlocks)
    .values({ userId: studentId, conceptId, unlockedByUserId: authResult.userId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, studentId, conceptId });
}
