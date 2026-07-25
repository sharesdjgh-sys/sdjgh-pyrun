import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, userConceptPractices, userConceptUnlocks, feedbackHistory, concepts } from "@/lib/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";
import { calculateProgress } from "@/lib/progress";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = context.userId;
  const curriculumId = await resolveCurriculumIdForUser(context);
  if (!curriculumId) return NextResponse.json({
    clearedConceptIds: [],
    manuallyUnlockedConceptIds: [],
    practicedConceptIds: [],
    totalConcepts: 0,
    feedbackHistory: [],
    progressPercent: 0,
  });

  try {

  const clears = await db
    .select({ conceptId: userConceptClears.conceptId })
    .from(userConceptClears)
    .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
    .where(and(
      eq(userConceptClears.userId, userId),
      eq(concepts.curriculumId, curriculumId),
      eq(concepts.isActive, true)
    ));

  const clearedConceptIds = clears.map((c) => c.conceptId);

  const manualUnlocks = await db
    .select({ conceptId: userConceptUnlocks.conceptId })
    .from(userConceptUnlocks)
    .innerJoin(concepts, eq(userConceptUnlocks.conceptId, concepts.id))
    .where(and(
      eq(userConceptUnlocks.userId, userId),
      eq(concepts.curriculumId, curriculumId),
      eq(concepts.isActive, true)
    ));

  const practices = await db
    .select({ conceptId: userConceptPractices.conceptId })
    .from(userConceptPractices)
    .innerJoin(concepts, eq(userConceptPractices.conceptId, concepts.id))
    .where(and(
      eq(userConceptPractices.userId, userId),
      eq(userConceptPractices.practiceSource, "selected"),
      eq(concepts.curriculumId, curriculumId),
      eq(concepts.isActive, true)
    ));
  const [{ count: totalConcepts }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(concepts)
    .where(and(eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true)));

  const history = await db
    .select()
    .from(feedbackHistory)
    .where(eq(feedbackHistory.userId, userId))
    .orderBy(desc(feedbackHistory.createdAt))
    .limit(50);

  const progressPercent = calculateProgress(clearedConceptIds.length, totalConcepts);

  return NextResponse.json({
    clearedConceptIds,
    manuallyUnlockedConceptIds: manualUnlocks.map((item) => item.conceptId),
    practicedConceptIds: practices.map((item) => item.conceptId),
    totalConcepts,
    feedbackHistory: history.map((h) => ({
      ...h,
      codeSnippet: h.codeSubmitted.slice(0, 100),
    })),
    progressPercent,
  });
  } catch (error) {
    console.error("Progress API error", { userId, curriculumId, error });
    return NextResponse.json({ error: "학습 기록을 불러오지 못했습니다." }, { status: 500 });
  }
}
