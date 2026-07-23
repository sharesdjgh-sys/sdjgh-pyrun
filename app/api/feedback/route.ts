import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, userConceptPractices, userConceptUnlocks, feedbackHistory, concepts } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { generateFeedback, judgePractice } from "@/lib/gemini";
import { effectiveConceptAccessIds, isConceptUnlocked } from "@/lib/progress";
import { parsePython } from "@/lib/python-parser";
import { rateLimit, RequestValidationError, validateFeedback } from "@/lib/api-guard";
import { isStudentRole } from "@/lib/roles";
import { createStudentPracticeTemplate } from "@/lib/practice-template";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = Number(session.user.id);
  const role = (session.user as { role?: string }).role;
  const isStudent = isStudentRole(role);

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
      let clearedIds: number[] = [];
      let manuallyUnlockedIds: number[] = [];
      if (isStudent) {
        const [clears, manualUnlocks] = await Promise.all([
          db
            .select({ conceptId: userConceptClears.conceptId })
            .from(userConceptClears)
            .where(eq(userConceptClears.userId, userId)),
          db
            .select({ conceptId: userConceptUnlocks.conceptId })
            .from(userConceptUnlocks)
            .where(eq(userConceptUnlocks.userId, userId)),
        ]);
        clearedIds = clears.map((c) => c.conceptId);
        manuallyUnlockedIds = manualUnlocks.map((item) => item.conceptId);
      }

      const accessIds = effectiveConceptAccessIds(clearedIds, manuallyUnlockedIds);

      // 학생에게만 순차 잠금을 적용한다. 교사와 관리자는 모든 문제를 자유롭게 확인할 수 있다.
      if (!isStudent || isConceptUnlocked(practiceConceptId, accessIds)) {
        const [concept] = await db
          .select({ nameKo: concepts.nameKo, practiceCode: concepts.practiceCode })
          .from(concepts)
          .where(eq(concepts.id, practiceConceptId));

        if (concept?.practiceCode) {
          const verdict = await judgePractice({
            conceptName: concept.nameKo,
            problem: createStudentPracticeTemplate(concept.practiceCode),
            code,
            stdout: stdout || "",
          });

          if (verdict) {
            feedback = verdict.feedback;
            solved = verdict.solved;
          }

          // 뱃지(개념 클리어 기록)는 학생 계정에만 지급한다.
          if (isStudent && solved && !clearedIds.includes(practiceConceptId)) {
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
