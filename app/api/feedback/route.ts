import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, userConceptPractices, userConceptUnlocks, feedbackHistory, concepts, aiPracticeChallenges } from "@/lib/db/schema";
import { and, count, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { generateFeedback, judgePractice } from "@/lib/gemini";
import { effectiveConceptAccessIdsForOrders, isConceptUnlockedInOrders } from "@/lib/progress";
import { parsePython } from "@/lib/python-parser";
import { rateLimit, RequestValidationError, validateFeedback } from "@/lib/api-guard";
import { isStudentRole } from "@/lib/roles";
import {
  createStudentPracticeTemplate,
  extractExpectedOutput,
  isExactExpectedOutput,
  matchesExpectedOutput,
} from "@/lib/practice-template";
import {
  curriculumOrders,
  getCurriculumUnits,
  resolveCurriculumIdForUser,
  sessionTenant,
} from "@/lib/curriculum-access";
import { syncAiRewardGrants, syncGroupRewardGrants } from "@/lib/customization";
import { AI_REWARD_CONCEPT_LIMIT } from "@/lib/cosmetics";

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = context.userId;
  const role = context.role;
  const isStudent = isStudentRole(role);
  const curriculumId = await resolveCurriculumIdForUser(context);
  const curriculumUnits = curriculumId ? await getCurriculumUnits(curriculumId) : [];
  const orders = curriculumOrders(curriculumUnits);

  try {
    const rate = rateLimit(req, `feedback:${userId}`, 15);
    if (!rate.allowed) {
      return NextResponse.json({ error: "피드백 요청이 너무 많습니다." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }
    const { code, stdout, stderr, isSuccess, practiceConceptId, aiChallengeId } = validateFeedback(await req.json());
    const practiceUnit = practiceConceptId === null
      ? undefined
      : curriculumUnits.find((unit) => unit.id === practiceConceptId);

    // Server-side re-parse (don't trust client-sent concept IDs)
    const parseResult = parsePython(code || "");
    const detectedConceptIds = parseResult.concepts.map((c) => c.conceptId);

    // Get concept names for AI feedback
    const conceptNames: string[] = [];
    const mappedDetectedConceptIds: number[] = [];
    if (detectedConceptIds.length > 0) {
      const conceptRows = await db
        .select({ id: concepts.id, nameKo: concepts.nameKo })
        .from(concepts)
        .where(and(
          curriculumId ? eq(concepts.curriculumId, curriculumId) : eq(concepts.curriculumId, -1),
          inArray(concepts.sourceConceptId, detectedConceptIds),
          eq(concepts.isActive, true)
        ));
      conceptNames.push(...conceptRows.map((c) => c.nameKo));
      mappedDetectedConceptIds.push(...conceptRows.map((c) => c.id));
    }

    // 연습문제 풀이인 경우: 문제 지문은 클라이언트를 믿지 않고 DB에서 직접 읽어 Gemini로 채점한다.
    let feedback: string | null = null;
    let solved: boolean | null = null;
    const newlyEarnedConceptIds: number[] = [];
    const newlyEarnedRewardIds: number[] = [];
    let clearedIds: number[] = [];
    let canAccessPractice = false;

    if (practiceConceptId !== null && practiceUnit) {
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

      const accessIds = effectiveConceptAccessIdsForOrders(clearedIds, manuallyUnlockedIds, orders);
      canAccessPractice =
        !isStudent ||
        practiceUnit.sourceConceptId === 0 ||
        isConceptUnlockedInOrders(practiceConceptId, accessIds, orders);

      if (canAccessPractice && (!isSuccess || !parseResult.syntaxValid)) {
        solved = false;
      }
    }

    // 학생에게만 순차 잠금을 적용한다. 교사와 관리자는 모든 문제를 자유롭게 확인할 수 있다.
    if (practiceConceptId !== null && canAccessPractice && isSuccess && parseResult.syntaxValid) {
      const [concept] = await db
        .select({ nameKo: concepts.nameKo, practiceCode: concepts.practiceCode })
        .from(concepts)
        .where(and(
          eq(concepts.id, practiceConceptId),
          curriculumId ? eq(concepts.curriculumId, curriculumId) : eq(concepts.curriculumId, -1),
          eq(concepts.isActive, true)
        ));

      if (concept?.practiceCode) {
        const studentProblem = createStudentPracticeTemplate(concept.practiceCode);
        const expectedOutput = extractExpectedOutput(concept.practiceCode);

        if (
          expectedOutput &&
          isExactExpectedOutput(expectedOutput) &&
          !matchesExpectedOutput(expectedOutput, stdout || "")
        ) {
          solved = false;
          feedback = "코드는 실행됐지만 출력 결과가 문제의 예시와 달라. `[출력 결과]`의 각 줄과 비교해서 빠진 내용이나 값이 다른 부분을 다시 확인해보자!";
        } else {
          const verdict = await judgePractice({
            conceptName: concept.nameKo,
            problem: studentProblem,
            code,
            stdout: stdout || "",
          });

          if (verdict) {
            feedback = verdict.feedback;
            solved = verdict.solved;
          }
        }

        // 뱃지(개념 클리어 기록)는 학생 계정에만 지급한다.
        if (isStudent && solved === true && !clearedIds.includes(practiceConceptId)) {
          await db
            .insert(userConceptClears)
            .values({ userId, conceptId: practiceConceptId })
            .onConflictDoNothing();
          newlyEarnedConceptIds.push(practiceConceptId);
        }
      }
    }

    // 문제 풀이 기록은 학생에게 모호한 "채점 대기" 상태를 남기지 않는다.
    // AI 판정이 일시적으로 실패해도 미해결 기록으로 저장해 복습할 수 있게 한다.
    if (practiceConceptId !== null && canAccessPractice && solved === null) {
      solved = false;
    }

    if (aiChallengeId !== null) {
      const [challenge] = await db
        .select({
          id: aiPracticeChallenges.id,
          expectedOutput: aiPracticeChallenges.expectedOutput,
          solvedAt: aiPracticeChallenges.solvedAt,
          conceptId: aiPracticeChallenges.conceptId,
        })
        .from(aiPracticeChallenges)
        .innerJoin(concepts, eq(aiPracticeChallenges.conceptId, concepts.id))
        .where(and(
          eq(aiPracticeChallenges.id, aiChallengeId),
          eq(aiPracticeChallenges.userId, userId),
          curriculumId ? eq(concepts.curriculumId, curriculumId) : eq(concepts.curriculumId, -1),
        ))
        .limit(1);
      if (challenge) {
        solved = isSuccess && parseResult.syntaxValid && matchesExpectedOutput(challenge.expectedOutput, stdout || "");
        let firstSolveRecorded = false;
        if (solved && !challenge.solvedAt) {
          const firstSolve = await db.update(aiPracticeChallenges)
            .set({ solvedAt: new Date() })
            .where(and(eq(aiPracticeChallenges.id, challenge.id), isNull(aiPracticeChallenges.solvedAt)))
            .returning({ id: aiPracticeChallenges.id });
          firstSolveRecorded = firstSolve.length > 0;
          if (firstSolve.length > 0 && curriculumId) {
            newlyEarnedRewardIds.push(...await syncAiRewardGrants(userId, curriculumId));
          }
        }
        if (solved && firstSolveRecorded) {
          const [{ solvedCount }] = await db.select({ solvedCount: count() }).from(aiPracticeChallenges)
            .where(and(eq(aiPracticeChallenges.userId, userId), eq(aiPracticeChallenges.conceptId, challenge.conceptId), isNotNull(aiPracticeChallenges.solvedAt)));
          feedback = Number(solvedCount) > AI_REWARD_CONCEPT_LIMIT
            ? `AI 추가 문제 성공! 이 목차는 보상에 반영되는 ${AI_REWARD_CONCEPT_LIMIT}개를 이미 해결했어요. 이번 풀이는 연습으로 기록돼요. 아이템을 더 모으려면 다른 목차에 도전해 보세요!`
            : `AI 추가 문제 성공! 아이템 보상 진행도에 반영했어요. 이 목차에서는 ${solvedCount}/${AI_REWARD_CONCEPT_LIMIT}개를 해결했어요.${Number(solvedCount) === AI_REWARD_CONCEPT_LIMIT ? " 다음 보상 도전은 다른 목차에서 해 보세요!" : ""}`;
        } else {
          feedback = solved
            ? "AI 추가 문제 성공! 이미 해결한 문제라 보상 진행도에는 다시 반영되지 않아요."
            : "실행은 되었지만 아직 예시 출력과 정확히 같지 않아요. 문제의 출력 조건을 한 줄씩 비교해 보세요.";
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

    // 실제로 "문제 풀기"에서 선택해 실행한 단원만 연습 기록으로 인정한다.
    if (practiceConceptId !== null && canAccessPractice) {
      await db
        .insert(userConceptPractices)
        .values({ userId, conceptId: practiceConceptId, practiceSource: "selected" })
        .onConflictDoUpdate({
          target: [userConceptPractices.userId, userConceptPractices.conceptId],
          set: { practiceSource: "selected", practicedAt: new Date() },
        });
    }

    // Save feedback history
    await db.insert(feedbackHistory).values({
      userId,
      conceptIds: mappedDetectedConceptIds,
      practiceConceptId: practiceConceptId !== null && canAccessPractice ? practiceConceptId : null,
      codeSubmitted: code || "",
      outputText: stdout || null,
      aiFeedback: feedback,
      isSuccess,
      isSolved: solved,
    });

    if (newlyEarnedConceptIds.length > 0 && curriculumId) {
      newlyEarnedRewardIds.push(...await syncGroupRewardGrants(userId, curriculumId, curriculumUnits));
    }

    return NextResponse.json({
      feedback,
      // 축하 오버레이는 conceptId 기준으로 뱃지 메타데이터를 찾는다.
      newlyEarnedBadgeIds: newlyEarnedConceptIds,
      newlyEarnedRewardIds,
      practicedConceptIds: practiceConceptId !== null && canAccessPractice ? [practiceConceptId] : [],
      completionStatus: solved === true ? "cleared" : solved === false ? "incorrect" : "unjudged",
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
