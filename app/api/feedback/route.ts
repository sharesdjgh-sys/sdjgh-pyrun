import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, feedbackHistory, concepts, badges } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { generateFeedback } from "@/lib/gemini";
import { parsePython } from "@/lib/python-parser";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  try {
    const { code, stdout, stderr, isSuccess } = await req.json();

    // Server-side re-parse (don't trust client-sent concept IDs)
    const parseResult = parsePython(code || "");
    const detectedConceptIds = parseResult.concepts.map((c) => c.conceptId);

    // Get concept names for AI feedback
    const conceptNames: string[] = [];
    if (detectedConceptIds.length > 0) {
      const conceptRows = await db
        .select({ nameKo: concepts.nameKo })
        .from(concepts)
        .where(inArray(concepts.id, detectedConceptIds));
      conceptNames.push(...conceptRows.map((c) => c.nameKo));
    }

    // Generate AI feedback
    const feedback = await generateFeedback({
      code,
      stdout: stdout || "",
      stderr: stderr || "",
      isSuccess,
      detectedConceptNames: conceptNames,
    });

    // Find which concepts are newly cleared (not previously cleared by this user)
    const newlyEarnedBadgeIds: number[] = [];

    if (isSuccess && detectedConceptIds.length > 0) {
      const existingClears = await db
        .select({ conceptId: userConceptClears.conceptId })
        .from(userConceptClears)
        .where(
          and(
            eq(userConceptClears.userId, userId),
            inArray(userConceptClears.conceptId, detectedConceptIds)
          )
        );
      const alreadyClearedIds = new Set(existingClears.map((c) => c.conceptId));
      const newConceptIds = detectedConceptIds.filter((id) => !alreadyClearedIds.has(id));

      // Insert new clears
      for (const conceptId of newConceptIds) {
        await db
          .insert(userConceptClears)
          .values({ userId, conceptId })
          .onConflictDoNothing();
      }

      // Get badge IDs for newly cleared concepts
      if (newConceptIds.length > 0) {
        const earnedBadges = await db
          .select({ id: badges.id })
          .from(badges)
          .where(inArray(badges.conceptId, newConceptIds));
        newlyEarnedBadgeIds.push(...earnedBadges.map((b) => b.id));
      }
    }

    // Save feedback history
    await db.insert(feedbackHistory).values({
      userId,
      conceptIds: detectedConceptIds,
      codeSubmitted: code || "",
      outputText: stdout || null,
      aiFeedback: feedback,
      isSuccess,
    });

    return NextResponse.json({ feedback, newlyEarnedBadgeIds });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
