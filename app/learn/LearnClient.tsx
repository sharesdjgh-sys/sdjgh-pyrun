"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { usePyodide } from "@/hooks/usePyodide";
import { parsePython } from "@/lib/python-parser";
import { animationQueue, type RobotCommand } from "@/lib/animation-queue";
import RobotStage from "@/components/robot/RobotStage";
import RobotApiTooltip from "@/components/robot/RobotApiTooltip";
import OutputPanel from "@/components/editor/OutputPanel";
import BadgeCelebration from "@/components/badges/BadgeCelebration";
import Header from "@/components/layout/Header";
import { BADGE_METADATA, CONCEPT_EXAMPLES } from "@/lib/curriculum";
import { COLOR_HEX } from "@/components/badges/colorMap";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

// 초기 코드는 학생들이 robot API를 바로 경험해볼 수 있도록 작성
const INITIAL_CODE = `# 파이썬 코드를 여기에 입력하세요
import robot

robot.say("안녕! 나는 AI 로봇이야!")
robot.move(2)
robot.draw("star")
robot.dance()
`;

interface LearnClientProps {
  userName: string;
}

export default function LearnClient({ userName }: LearnClientProps) {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [execError, setExecError] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [newBadgeIds, setNewBadgeIds] = useState<number[]>([]);
  const [earnedConceptIds, setEarnedConceptIds] = useState<Set<number>>(new Set());
  const [selectedConceptId, setSelectedConceptId] = useState(1);

  // 캐릭터 선택 스킨 상태
  const [characterType, setCharacterType] = useState<"robot" | "dog" | "game">("robot");
  const [isError, setIsError] = useState(false);

  // 로봇 제어 관련 상태
  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<{
    feedback: string;
    badgeIds: number[];
  } | null>(null);

  // 변수 실시간 감지 상태
  const [varName, setVarName] = useState<string>("");
  const [varValue, setVarValue] = useState<string>("");
  const [showVariable, setShowVariable] = useState(false);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { loading: pyLoading, executeCode } = usePyodide();

  const showSpeechBubble = useCallback((text: string, duration = 8000) => {
    setSpeechText(text);
    setShowSpeech(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      showSpeechBubble(
        `안녕, ${userName}! 나는 AI 코딩 친구야. 단원을 선택하고 예제를 불러오거나 코드를 직접 수정해봐! robot.move(2) 처럼 코드를 쓰면 내가 스테이지에서 직접 움직여!`,
        11000
      );
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRun = useCallback(async () => {
    if (running || pyLoading) return;
    setRunning(true);
    setHasRun(true);
    setShowSpeech(false);
    setCommands([]);
    setPendingFeedback(null);
    setShowVariable(false);
    setIsError(false);

    // 1. 코드 실행 (이때 Pyodide 안에서 robotApi 함수들이 실행되며 animationQueue에 명령어 축적)
    const { stdout, stderr, success } = await executeCode(code);
    setOutput(stdout);
    setExecError(stderr);
    setIsError(!success);

    // 문법 개념 파싱 (기존 뱃지 지급 감지용)
    const parseResult = parsePython(code);
    const primary = parseResult.primaryConcept;

    // 변수 감지 시 스테이지에 전달할 변수 상태 설정
    if (success && primary && primary.conceptKey === "variable") {
      setVarName((primary.details.lastVarName as string) || "");
      setVarValue((primary.details.lastVarValue as string) || "");
      setShowVariable(true);
    }

    // 2. 애니메이션 큐 추출 및 로봇 스테이지 전달
    const queueCommands = animationQueue.get();
    setCommands(queueCommands);

    try {
      // 3. AI 피드백 호출
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdout, stderr, isSuccess: success }),
      });

      if (res.ok) {
        const data = await res.json();
        let feedback: string = data.feedback;
        const badgeIds: number[] = data.newlyEarnedBadgeIds;

        // 에러 상황이면 규칙 기반 설명과 AI 피드백을 결합
        if (!success) {
          const friendlyExplanation = getFriendlyErrorExplanation(stderr);
          if (feedback.includes("코드에 오류가 있어요") || feedback.trim().length === 0) {
            feedback = friendlyExplanation;
          } else {
            feedback = `${friendlyExplanation}\n\n💡 힌트: ${feedback}`;
          }
        }

        // 학습 뱃지 획득 여부 로컬 반영
        setEarnedConceptIds((prev) => {
          const next = new Set(prev);
          if (success) {
            parseResult.concepts.forEach((c) => next.add(c.conceptId));
          }
          return next;
        });

        // 성공이고 애니메이션 명령이 있을 때만 피드백 예약을 하고, 에러 상황이거나 명령어가 없으면 즉시 띄움
        if (success && queueCommands.length > 0) {
          setPendingFeedback({ feedback, badgeIds });
        } else {
          setPendingFeedback(null);
          showSpeechBubble(feedback);
          if (success && badgeIds.length > 0) {
            setNewBadgeIds(badgeIds);
            // 뱃지 획득 시 스테이지의 로봇이 춤을 추도록 지시
            setCommands([{ type: "dance", params: {} }]);
          }
        }
      } else {
        const fallback = success ? "잘 했어요! 코드가 잘 동작합니다." : getFriendlyErrorExplanation(stderr);
        if (success && queueCommands.length > 0) {
          setPendingFeedback({ feedback: fallback, badgeIds: [] });
        } else {
          setPendingFeedback(null);
          showSpeechBubble(fallback);
        }
      }
    } catch {
      const fallback = success ? "잘 했어요! 코드가 잘 동작합니다." : getFriendlyErrorExplanation(stderr);
      if (success && queueCommands.length > 0) {
        setPendingFeedback({ feedback: fallback, badgeIds: [] });
      } else {
        setPendingFeedback(null);
        showSpeechBubble(fallback);
      }
    }

    setRunning(false);
  }, [running, pyLoading, code, executeCode, showSpeechBubble]);

  // 애니메이션 큐 재생 완료 콜백
  const handleAnimationComplete = useCallback(() => {
    if (pendingFeedback) {
      showSpeechBubble(pendingFeedback.feedback);
      if (pendingFeedback.badgeIds.length > 0) {
        setNewBadgeIds(pendingFeedback.badgeIds);
        // 뱃지 획득을 축하하며 로봇이 댄스를 춤
        setCommands([{ type: "dance", params: {} }]);
      }
      setPendingFeedback(null);
    }
  }, [pendingFeedback, showSpeechBubble]);

  const handleLoadExample = useCallback(() => {
    const example = CONCEPT_EXAMPLES[selectedConceptId];
    if (example) setCode(example.exampleCode);
  }, [selectedConceptId]);

  const handleReset = useCallback(() => {
    setCode(INITIAL_CODE);
    setOutput("");
    setExecError("");
    setHasRun(false);
    setShowSpeech(false);
    setCommands([]);
    setPendingFeedback(null);
    setShowVariable(false);
    setIsError(false);
  }, []);

  const unitTitle = BADGE_METADATA[selectedConceptId - 1]?.nameKo.replace(" 마스터", "") || "출력";

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)",
      }}
    >
      <Header />

      {/* Unit tabs */}
      <div style={{ flex: "none", padding: "12px 22px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          <span style={{ flex: "none", fontSize: 12.5, fontWeight: 700, color: "#A39CC0", marginRight: 2 }}>
            단원
          </span>
          {BADGE_METADATA.map((badge, idx) => {
            const cid = idx + 1;
            const selected = cid === selectedConceptId;
            return (
              <button
                key={cid}
                onClick={() => {
                  setSelectedConceptId(cid);
                  const example = CONCEPT_EXAMPLES[cid];
                  if (example) setCode(example.exampleCode);
                }}
                style={{
                  flex: "none",
                  whiteSpace: "nowrap",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "7px 14px",
                  borderRadius: 99,
                  transition: "all .15s",
                  ...(selected
                    ? {
                        background: "linear-gradient(180deg,#8B6CFF,#7B5CF0)",
                        color: "#fff",
                        boxShadow: "0 4px 10px rgba(123,92,240,.34)",
                      }
                    : { background: "#fff", color: "#8B83A8", border: "1.5px solid #ECE7F8" }),
                }}
              >
                {badge.nameKo.replace(" 마스터", "")}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workspace */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 18, padding: "8px 22px 22px" }}>
        {/* Editor column */}
        <div style={{ flex: 1.15, minWidth: 0, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              borderRadius: 22,
              border: "1px solid #EFEAF8",
              boxShadow: "0 12px 30px rgba(90,63,214,.07)",
              overflow: "hidden",
            }}
          >
            {/* Editor titlebar */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 18px",
                borderBottom: "1px solid #F2EDF9",
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5C8A", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFC23C", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#18C99A", display: "inline-block" }} />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#9A93B5",
                  marginLeft: 6,
                }}
              >
                main.py
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <RobotApiTooltip />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#7B5CF0",
                    background: "#F2ECFD",
                    padding: "4px 11px",
                    borderRadius: 99,
                  }}
                >
                  {unitTitle} 단원
                </span>
              </div>
            </div>

            {/* Code editor */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <CodeEditor value={code} onChange={setCode} />
            </div>

            {/* Output */}
            <div style={{ flex: "none", borderTop: "1px solid #F2EDF9", background: "#FAF8FF" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "10px 18px 6px",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  color: "#A39CC0",
                  textTransform: "uppercase",
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="4 17 10 11 4 5" />
                  <line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                실행 결과
              </div>
              <OutputPanel output={output} error={execError} hasRun={hasRun} />
            </div>

            {/* Actions */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "13px 18px",
                borderTop: "1px solid #F2EDF9",
              }}
            >
              <button
                onClick={handleRun}
                disabled={running || pyLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: 14,
                  background:
                    running || pyLoading
                      ? "#5ED4AA"
                      : "linear-gradient(180deg,#34D9A6,#18C99A)",
                  color: "#fff",
                  fontFamily: "var(--font-jua), 'Jua', sans-serif",
                  fontSize: 15.5,
                  cursor: running || pyLoading ? "not-allowed" : "pointer",
                  boxShadow: "0 5px 0 #0FA37C,0 9px 18px rgba(24,201,154,.32)",
                  transition: "transform .12s,box-shadow .12s",
                  animation:
                    !hasRun && !running && !pyLoading ? "runPulse 1.8s ease-in-out infinite" : undefined,
                }}
                onMouseDown={(e) => {
                  if (!running && !pyLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #0FA37C";
                  }
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow =
                    "0 5px 0 #0FA37C,0 9px 18px rgba(24,201,154,.32)";
                }}
              >
                {running ? (
                  <span
                    style={{
                      width: 18,
                      height: 18,
                      border: "2.5px solid #fff",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" stroke="none">
                    <path d="M7 4l13 8-13 8z" />
                  </svg>
                )}
                {running ? "실행 중..." : "실행"}
              </button>

              <button
                onClick={handleLoadExample}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  padding: "12px 18px",
                  border: "1.5px solid #ECE7F8",
                  borderRadius: 14,
                  background: "#fff",
                  color: "#7B5CF0",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                예제 불러오기
              </button>

              <button
                onClick={handleReset}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 14px",
                  border: "none",
                  borderRadius: 12,
                  background: "transparent",
                  color: "#A39CC0",
                  fontWeight: 600,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#7B5CF0";
                  (e.currentTarget as HTMLButtonElement).style.background = "#F6F2FE";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#A39CC0";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="15"
                  height="15"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
                </svg>
                초기화
              </button>

              {pyLoading && (
                <span
                  style={{ fontSize: 12, color: "#A39CC0", display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      border: "2px solid #A39CC0",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      display: "inline-block",
                    }}
                  />
                  파이썬 로드 중...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Robot column */}
        <div style={{ flex: 0.85, minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(165deg,#FBF7FF,#F3ECFE)",
              borderRadius: 22,
              border: "1px solid #EFEAF8",
              boxShadow: "0 12px 30px rgba(90,63,214,.07)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* AI feedback speech bubble (오른쪽 헤더 쪽에 작게 멘토 팁처럼 제공) */}
            <div
              style={{
                flex: "none",
                minHeight: 70,
                padding: "12px 18px 4px",
                display: "flex",
                justifyContent: "center",
              }}
            >
              {/* 메인 로봇 캐릭터 말풍선 외에, 
                  Gemini 피드백은 학생들에게 직접 조언하는 용도이므로 별도의 멘토 피드백 영역으로 배치 */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  background: showSpeech ? "#7B5CF0" : "#fff",
                  border: showSpeech ? "none" : "1.5px dashed #C9C1DE",
                  borderRadius: 16,
                  padding: "10px 14px",
                  boxShadow: showSpeech ? "0 8px 16px rgba(123,92,240,.24)" : "none",
                  transition: "all .3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 52,
                }}
              >
                <div
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.4,
                    color: showSpeech ? "#fff" : "#8B83A8",
                    textAlign: "center",
                  }}
                >
                  {showSpeech ? speechText : "파이썬 코드를 작성하고 실행하면 여기에 힌트와 설명이 나타나요!"}
                </div>
              </div>
            </div>

            {/* 캐릭터 선택 탭 */}
            <div style={{ flex: "none", display: "flex", justifyContent: "center", gap: 6, padding: "2px 18px 10px" }}>
              {(["robot", "dog", "game"] as const).map((type) => {
                const isSelected = characterType === type;
                const labels = { robot: "🤖 로봇", dog: "🐶 강아지", game: "⚔️ 전사" };
                return (
                  <button
                    key={type}
                    onClick={() => setCharacterType(type)}
                    style={{
                      background: isSelected ? "linear-gradient(180deg,#8B6CFF,#7B5CF0)" : "#fff",
                      color: isSelected ? "#fff" : "#8B83A8",
                      fontSize: 12,
                      fontWeight: 700,
                      padding: "5px 12px",
                      borderRadius: 10,
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 3px 8px rgba(123,92,240,.24)" : "none",
                      border: isSelected ? "none" : "1.5px solid #ECE7F8",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            {/* Robot 2D Stage */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: "0 18px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {pyLoading && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(251,247,255,.9)",
                    gap: 12,
                    zIndex: 40,
                    borderRadius: 22,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      border: "3.5px solid #C6A2EC",
                      borderTopColor: "#7B5CF0",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <p style={{ fontSize: 13.5, color: "#8B83A8", margin: 0, fontWeight: 700 }}>
                    파이썬 엔진 로드 중...
                  </p>
                  <p style={{ fontSize: 12, color: "#BDB6D4", margin: 0 }}>
                    처음 준비할 때 약 10~30초 정도 소요됩니다.
                  </p>
                </div>
              )}

              {/* 2D 인터랙티브 스테이지 */}
              <RobotStage
                commands={commands}
                onAnimationComplete={handleAnimationComplete}
                varName={varName}
                varValue={varValue}
                showVariable={showVariable}
                characterType={characterType}
                isError={isError}
              />
            </div>


          </div>
        </div>
      </div>

      <BadgeCelebration badgeIds={newBadgeIds} onClose={() => setNewBadgeIds([])} />
    </div>
  );
}

function getFriendlyErrorExplanation(stderr: string): string {
  if (!stderr) return "으앙! 코드에 오류가 발생했어. 아래 검은색 결과 창의 빨간색 에러 메시지를 참고해서 고쳐볼래?";
  
  if (/IndentationError/.test(stderr)) {
    return "들여쓰기(IndentationError)가 잘못되었어요! 코드 줄 앞쪽의 빈칸(스페이스) 개수가 맞는지 확인해 줄래?";
  }
  if (/SyntaxError/.test(stderr)) {
    return "문법 오류(SyntaxError)가 발생했어요! 괄호 짝이 안 맞거나 끝에 콜론(:)이 빠지지 않았는지 살펴봐!";
  }
  if (/NameError/.test(stderr)) {
    const match = stderr.match(/name '([^']+)' is not defined/);
    const missingName = match ? match[1] : "";
    if (missingName === "robot") {
      return "앗! 'import robot'을 코드 맨 위에 적었는지 확인해봐! 나를 사용하려면 꼭 불러와야 해.";
    }
    return `앗, '${missingName}'(은)는 정의되지 않은 이름(NameError)이야! 오타가 났거나 미리 선언하지 않은 것 같아.`;
  }
  if (/TypeError/.test(stderr)) {
    return "서로 다른 종류의 데이터(숫자와 글자 등)를 섞어서 계산(TypeError)하려고 한 것 같아. 타입을 맞춰줘!";
  }
  if (/ZeroDivisionError/.test(stderr)) {
    return "어라? 컴퓨터는 0으로 숫자를 나눌 수 없어(ZeroDivisionError)! 나누는 수를 다른 숫자로 바꿔봐.";
  }
  if (/AttributeError/.test(stderr)) {
    const match = stderr.match(/attribute '([^']+)'/);
    const attr = match ? match[1] : "";
    return `나에게 '${attr}'(이)라는 동작(AttributeError)은 존재하지 않아! 내가 할 수 있는 동작 이름을 다시 확인해봐.`;
  }
  
  return "코드에 에러가 발생해서 동작을 완료하지 못했어. 아래 빨간색 에러 메시지를 잘 읽고 코드를 수정해보자!";
}
