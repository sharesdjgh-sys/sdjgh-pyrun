import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptPractices, feedbackHistory, concepts } from "@/lib/db/schema";
import { inArray } from "drizzle-orm";
import { generateFeedback } from "@/lib/gemini";
import { parsePython } from "@/lib/python-parser";
import { rateLimit, RequestValidationError, validateFeedback } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  try {
    const rate = rateLimit(req, `feedback:${userId}`, 15);
    if (!rate.allowed) {
      return NextResponse.json({ error: "피드백 요청이 너무 많습니다." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }
    const { code, stdout, stderr, isSuccess } = validateFeedback(await req.json());

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

    // A browser-reported success is recorded as practice only. Verified clears are
    // reserved for a future trusted evaluator and continue to drive badges.
    if (isSuccess && parseResult.syntaxValid) {
      for (const conceptId of detectedConceptIds) {
        await db
          .insert(userConceptPractices)
          .values({ userId, conceptId })
          .onConflictDoNothing();
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

    return NextResponse.json({
      feedback,
      newlyEarnedBadgeIds: [],
      practicedConceptIds: isSuccess && parseResult.syntaxValid ? detectedConceptIds : [],
      completionStatus: "practice",
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
