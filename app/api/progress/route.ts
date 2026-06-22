import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, userConceptPractices, feedbackHistory, concepts } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { authenticatedUserId, calculateProgress } from "@/lib/progress";

export async function GET() {
  const session = await auth();
  const userId = authenticatedUserId(session);
  if (!userId) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  try {

  const clears = await db
    .select({ conceptId: userConceptClears.conceptId })
    .from(userConceptClears)
    .where(eq(userConceptClears.userId, userId));

  const clearedConceptIds = clears.map((c) => c.conceptId);

  const practices = await db
    .select({ conceptId: userConceptPractices.conceptId })
    .from(userConceptPractices)
    .where(eq(userConceptPractices.userId, userId));
  const [{ count: totalConcepts }] = await db.select({ count: sql<number>`count(*)::int` }).from(concepts);

  const history = await db
    .select()
    .from(feedbackHistory)
    .where(eq(feedbackHistory.userId, userId))
    .orderBy(desc(feedbackHistory.createdAt))
    .limit(50);

  const progressPercent = calculateProgress(clearedConceptIds.length, totalConcepts);

  return NextResponse.json({
    clearedConceptIds,
    practicedConceptIds: practices.map((item) => item.conceptId),
    totalConcepts,
    feedbackHistory: history.map((h) => ({
      ...h,
      codeSnippet: h.codeSubmitted.slice(0, 100),
    })),
    progressPercent,
  });
  } catch (error) {
    console.error("Progress API error", { userId, error });
    return NextResponse.json({ error: "학습 기록을 불러오지 못했습니다." }, { status: 500 });
  }
}
