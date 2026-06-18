import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, feedbackHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  const clears = await db
    .select({ conceptId: userConceptClears.conceptId })
    .from(userConceptClears)
    .where(eq(userConceptClears.userId, userId));

  const clearedConceptIds = clears.map((c) => c.conceptId);

  const history = await db
    .select()
    .from(feedbackHistory)
    .where(eq(feedbackHistory.userId, userId))
    .orderBy(desc(feedbackHistory.createdAt))
    .limit(50);

  const progressPercent = Math.round((clearedConceptIds.length / 16) * 100);

  return NextResponse.json({
    clearedConceptIds,
    feedbackHistory: history.map((h) => ({
      ...h,
      codeSnippet: h.codeSubmitted.slice(0, 100),
    })),
    progressPercent,
  });
}
