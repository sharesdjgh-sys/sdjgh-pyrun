import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import {
  concepts,
  feedbackHistory,
  userConceptClears,
  userConceptPractices,
  userConceptUnlocks,
  users,
} from "@/lib/db/schema";
import { LEVEL_CONCEPT_ORDERS } from "@/lib/progress";
import { canOpenAdminPage } from "@/lib/roles";
import { asc, eq, inArray, sql } from "drizzle-orm";

async function requireTeacher() {
  const session = await auth();
  const userId = Number(session?.user?.id);
  if (!session || !Number.isInteger(userId)) {
    return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }

  const [currentUser] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!currentUser || !canOpenAdminPage(currentUser.role)) {
    return { denied: NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 }) };
  }

  return { userId };
}

export async function GET() {
  const authResult = await requireTeacher();
  if ("denied" in authResult) return authResult.denied;

  try {
    const studentRows = await db
      .select({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.role, "student"))
      .orderBy(asc(users.id));

    if (studentRows.length === 0) return NextResponse.json({ students: [] });

    const studentIds = studentRows.map((student) => student.id);
    const [clears, practices, manualUnlocks, activity] = await Promise.all([
      db
        .select({ userId: userConceptClears.userId, conceptId: userConceptClears.conceptId })
        .from(userConceptClears)
        .where(inArray(userConceptClears.userId, studentIds)),
      db
        .select({ userId: userConceptPractices.userId, conceptId: userConceptPractices.conceptId })
        .from(userConceptPractices)
        .where(inArray(userConceptPractices.userId, studentIds)),
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
    ]);

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
  const learningConceptIds = new Set(LEVEL_CONCEPT_ORDERS.flat());

  if (!Number.isInteger(studentId) || studentId <= 0 || !Number.isInteger(conceptId) || !learningConceptIds.has(conceptId)) {
    return NextResponse.json({ error: "유효하지 않은 학생 또는 단원입니다." }, { status: 400 });
  }

  const [[student], [concept]] = await Promise.all([
    db.select({ id: users.id, role: users.role }).from(users).where(eq(users.id, studentId)).limit(1),
    db.select({ id: concepts.id }).from(concepts).where(eq(concepts.id, conceptId)).limit(1),
  ]);

  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "학생 계정을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!concept) {
    return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  }

  await db
    .insert(userConceptUnlocks)
    .values({ userId: studentId, conceptId, unlockedByUserId: authResult.userId })
    .onConflictDoNothing();

  return NextResponse.json({ ok: true, studentId, conceptId });
}
