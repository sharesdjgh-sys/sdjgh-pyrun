import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import {
  badges,
  classCurriculumAssignments,
  concepts,
  curriculumSets,
  feedbackHistory,
  teacherClassAssignments,
  teacherBadgeGrants,
  userConceptClears,
  userConceptPractices,
  userConceptUnlocks,
  users,
} from "@/lib/db/schema";
import { syncGroupRewardGrants } from "@/lib/customization";
import { curriculumLevelOrders } from "@/lib/curriculum-model";
import { effectiveConceptAccessIdsForOrders, isConceptUnlockedInOrders } from "@/lib/progress";
import {
  getCurriculumUnits,
  resolveCurriculumIdForUser,
  sessionTenant,
} from "@/lib/curriculum-access";
import { canManageStudentClass, canOpenAdminPage, isAdministratorRole } from "@/lib/roles";
import { parseSchoolStudentNumber } from "@/lib/student-number";
import { rateLimit } from "@/lib/api-guard";
import { and, asc, eq, inArray, isNull, sql } from "drizzle-orm";

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
        .where(and(
          eq(curriculumSets.schoolId, authResult.schoolId),
          isNull(curriculumSets.archivedAt)
        ))
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
  const action = body?.action === "resetPassword"
    ? "resetPassword"
    : body?.action === "unlockClassConcept"
      ? "unlockClassConcept"
      : body?.action === "grantBadge"
        ? "grantBadge"
      : "unlockConcept";

  if (action === "unlockClassConcept") {
    const rate = rateLimit(req, `teacher-class-unlock:${authResult.userId}`, 30, 10 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "학급 잠금 해제 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }

    const grade = Number(body?.grade);
    const classNumber = Number(body?.classNumber);
    const conceptId = Number(body?.conceptId);
    if (![grade, classNumber, conceptId].every((value) => Number.isInteger(value) && value > 0)) {
      return NextResponse.json({ error: "학급과 단원을 올바르게 선택해주세요." }, { status: 400 });
    }

    if (!isAdministratorRole(authResult.role)) {
      const assignments = await db
        .select({ grade: teacherClassAssignments.grade, classNumber: teacherClassAssignments.classNumber })
        .from(teacherClassAssignments)
        .where(eq(teacherClassAssignments.teacherUserId, authResult.userId));
      if (!canManageStudentClass(authResult.role, assignments, grade, classNumber)) {
        return NextResponse.json({ error: "담당 학급만 관리할 수 있습니다." }, { status: 403 });
      }
    }

    const [classCurriculum] = await db
      .select({ curriculumId: classCurriculumAssignments.curriculumId })
      .from(classCurriculumAssignments)
      .innerJoin(curriculumSets, eq(classCurriculumAssignments.curriculumId, curriculumSets.id))
      .where(and(
        eq(classCurriculumAssignments.schoolId, authResult.schoolId),
        eq(classCurriculumAssignments.grade, grade),
        eq(classCurriculumAssignments.classNumber, classNumber),
        eq(curriculumSets.schoolId, authResult.schoolId),
        isNull(curriculumSets.archivedAt)
      ))
      .limit(1);
    const [defaultCurriculum] = classCurriculum
      ? []
      : await db
          .select({ curriculumId: curriculumSets.id })
          .from(curriculumSets)
          .where(and(
            eq(curriculumSets.schoolId, authResult.schoolId),
            eq(curriculumSets.isDefault, true),
            isNull(curriculumSets.archivedAt)
          ))
          .orderBy(asc(curriculumSets.id))
          .limit(1);
    const curriculumId = classCurriculum?.curriculumId ?? defaultCurriculum?.curriculumId;
    const [concept] = curriculumId
      ? await db
          .select({ id: concepts.id })
          .from(concepts)
          .where(and(
            eq(concepts.id, conceptId),
            eq(concepts.curriculumId, curriculumId),
            eq(concepts.isActive, true)
          ))
          .limit(1)
      : [];
    if (!concept) {
      return NextResponse.json({ error: "선택한 학급에 배정된 커리큘럼의 단원이 아닙니다." }, { status: 400 });
    }

    const schoolStudents = await db
      .select({
        id: users.id,
        username: users.username,
        studentNumber: users.studentNumber,
        grade: users.grade,
        classNumber: users.classNumber,
      })
      .from(users)
      .where(and(eq(users.schoolId, authResult.schoolId), eq(users.role, "student")));
    const classStudentIds = schoolStudents
      .filter((student) => {
        const parsed = parseSchoolStudentNumber(student.studentNumber ?? student.username);
        return (parsed?.grade ?? student.grade) === grade &&
          (parsed?.classNumber ?? student.classNumber) === classNumber;
      })
      .map((student) => student.id);
    if (classStudentIds.length === 0) {
      return NextResponse.json({ error: "선택한 학급에 등록된 학생이 없습니다." }, { status: 404 });
    }

    const completed = await db
      .select({ userId: userConceptClears.userId })
      .from(userConceptClears)
      .where(and(
        inArray(userConceptClears.userId, classStudentIds),
        eq(userConceptClears.conceptId, conceptId)
      ));
    const completedIds = new Set(completed.map((item) => item.userId));
    const targetStudentIds = classStudentIds.filter((id) => !completedIds.has(id));
    const inserted = targetStudentIds.length > 0
      ? await db
          .insert(userConceptUnlocks)
          .values(targetStudentIds.map((userId) => ({
            userId,
            conceptId,
            unlockedByUserId: authResult.userId,
          })))
          .onConflictDoNothing()
          .returning({ userId: userConceptUnlocks.userId })
      : [];

    return NextResponse.json({
      ok: true,
      grade,
      classNumber,
      conceptId,
      studentCount: classStudentIds.length,
      eligibleCount: targetStudentIds.length,
      unlockedCount: inserted.length,
    });
  }

  const studentId = Number(body?.studentId);

  if (!Number.isInteger(studentId) || studentId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 학생입니다." }, { status: 400 });
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

  if (action === "resetPassword") {
    const rate = rateLimit(req, `teacher-password-reset:${authResult.userId}`, 20, 10 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "비밀번호 변경 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }
    const temporaryPassword = typeof body?.temporaryPassword === "string" ? body.temporaryPassword : "";
    if (temporaryPassword.length < 8 || temporaryPassword.length > 128) {
      return NextResponse.json({ error: "임시 비밀번호는 8~128자로 입력해 주세요." }, { status: 400 });
    }
    const bcrypt = await import("bcryptjs");
    await db
      .update(users)
      .set({ passwordHash: await bcrypt.hash(temporaryPassword, 10) })
      .where(and(eq(users.id, student.id), eq(users.schoolId, authResult.schoolId)));
    return NextResponse.json({ ok: true, studentId, action });
  }

  const conceptId = Number(body?.conceptId);
  if (!Number.isInteger(conceptId) || conceptId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 단원입니다." }, { status: 400 });
  }

  const assignedCurriculumId = await resolveCurriculumIdForUser({
    userId: student.id,
    schoolId: student.schoolId,
    role: "student",
  });
  const [concept] = assignedCurriculumId
    ? await db
        .select({ id: concepts.id, badgeId: badges.id })
        .from(concepts)
        .leftJoin(badges, eq(badges.conceptId, concepts.id))
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

  if (action === "grantBadge") {
    const rate = rateLimit(req, `teacher-badge-grant:${authResult.userId}`, 60, 10 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "뱃지 부여 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }
    if (!concept.badgeId) {
      return NextResponse.json({ error: "이 단원에는 부여할 뱃지가 없습니다." }, { status: 400 });
    }

    const curriculumUnits = await getCurriculumUnits(assignedCurriculumId!);
    const [studentClears, studentUnlocks] = await Promise.all([
      db
        .select({ conceptId: userConceptClears.conceptId })
        .from(userConceptClears)
        .where(eq(userConceptClears.userId, studentId)),
      db
        .select({ conceptId: userConceptUnlocks.conceptId })
        .from(userConceptUnlocks)
        .where(eq(userConceptUnlocks.userId, studentId)),
    ]);
    const conceptOrders = curriculumLevelOrders(curriculumUnits);
    const accessIds = effectiveConceptAccessIdsForOrders(
      studentClears.map((item) => item.conceptId),
      studentUnlocks.map((item) => item.conceptId),
      conceptOrders
    );
    if (!isConceptUnlockedInOrders(conceptId, accessIds, conceptOrders)) {
      return NextResponse.json({ error: "잠금 해제된 단원에만 뱃지를 부여할 수 있습니다." }, { status: 409 });
    }

    // 완료 기록과 다음 로그인용 축하 알림을 한 SQL 문에서 함께 생성한다.
    // 이미 완료한 단원에는 중복 뱃지나 축하 알림을 만들지 않는다.
    const result = await db.execute(sql`
      WITH new_clear AS (
        INSERT INTO ${userConceptClears} (user_id, concept_id)
        VALUES (${studentId}, ${conceptId})
        ON CONFLICT (user_id, concept_id) DO NOTHING
        RETURNING user_id, concept_id
      )
      INSERT INTO ${teacherBadgeGrants} (user_id, concept_id, granted_by_user_id)
      SELECT user_id, concept_id, ${authResult.userId} FROM new_clear
      ON CONFLICT (user_id, concept_id) DO NOTHING
      RETURNING id
    `);
    const granted = result.rows.length > 0;
    if (granted && assignedCurriculumId) {
      try {
        await syncGroupRewardGrants(
          studentId,
          assignedCurriculumId,
          curriculumUnits
        );
      } catch (rewardError) {
        // 뱃지 부여 자체는 이미 원자적으로 완료됐다. 부가 아이템 동기화 실패로
        // 교사가 다시 눌러 중복 처리하지 않도록 성공 응답은 유지한다.
        console.error("Teacher badge group reward sync failed", { studentId, conceptId, rewardError });
      }
    }

    return NextResponse.json({
      ok: true,
      studentId,
      conceptId,
      granted,
      alreadyEarned: !granted,
    });
  }

  await db
    .insert(userConceptUnlocks)
    .values({ userId: studentId, conceptId, unlockedByUserId: authResult.userId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, studentId, conceptId });
}
