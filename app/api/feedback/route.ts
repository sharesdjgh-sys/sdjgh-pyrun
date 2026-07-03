import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, userConceptPractices, feedbackHistory, concepts } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { generateFeedback, judgePractice } from "@/lib/gemini";
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
    const { code, stdout, stderr, isSuccess, practiceConceptId } = validateFeedback(await req.json());

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

    // 연습문제 풀이인 경우: 문제 지문은 클라이언트를 믿지 않고 DB에서 직접 읽어 Gemini로 채점한다.
    let feedback: string | null = null;
    let solved = false;
    const newlyEarnedConceptIds: number[] = [];

    if (practiceConceptId !== null && isSuccess && parseResult.syntaxValid) {
      const [concept] = await db
        .select({ nameKo: concepts.nameKo, practiceCode: concepts.practiceCode })
        .from(concepts)
        .where(eq(concepts.id, practiceConceptId));

      if (concept?.practiceCode) {
        const verdict = await judgePractice({
          conceptName: concept.nameKo,
          problem: concept.practiceCode,
          code,
          stdout: stdout || "",
        });

        if (verdict) {
          feedback = verdict.feedback;
          solved = verdict.solved;
        }

        if (solved) {
          const existing = await db
            .select({ id: userConceptClears.id })
            .from(userConceptClears)
            .where(and(eq(userConceptClears.userId, userId), eq(userConceptClears.conceptId, practiceConceptId)));

          if (existing.length === 0) {
            await db
              .insert(userConceptClears)
              .values({ userId, conceptId: practiceConceptId })
              .onConflictDoNothing();
            newlyEarnedConceptIds.push(practiceConceptId);
          }
        }
      }
    }

    // 채점 대상이 아니거나 Gemini 채점이 실패한 경우 일반 피드백 생성
    if (feedback === null) {
      feedback = await generateFeedback({
        code,
        stdout: stdout || "",
        stderr: stderr || "",
        isSuccess,
        detectedConceptNames: conceptNames,
      });
    }

    // Browser-reported successes are also recorded as practice evidence.
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
      // 축하 오버레이는 conceptId 기준으로 뱃지 메타데이터를 찾는다.
      newlyEarnedBadgeIds: newlyEarnedConceptIds,
      practicedConceptIds: isSuccess && parseResult.syntaxValid ? detectedConceptIds : [],
      completionStatus: solved ? "cleared" : "practice",
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
