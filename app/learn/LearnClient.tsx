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
import { BADGE_METADATA, BADGE_METADATA_LV2, UNIT_GROUPS_LV1, UNIT_GROUPS_LV2 } from "@/lib/curriculum";
import type { CurriculumItem } from "@/lib/curriculum";
import { Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert, PawPrint, Sword } from "lucide-react";
import Image from "next/image";

const GROUP_ICON_MAP: Record<string, React.ElementType> = {
  Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert,
};

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const INITIAL_CODE = `# 파이썬 코드를 여기에 입력하세요
import robot

robot.say("안녕! 나는 AI 로봇이야!")
robot.move(2)
robot.draw("star")
robot.dance()
`;

interface LearnClientProps {
  userName: string;
  curriculum: Record<number, CurriculumItem>;
}

export default function LearnClient({ userName, curriculum }: LearnClientProps) {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [execError, setExecError] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [newBadgeIds, setNewBadgeIds] = useState<number[]>([]);
  const [selectedConceptId, setSelectedConceptId] = useState(0);
  const [conceptExpanded, setConceptExpanded] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [fontSize, setFontSize] = useState(9);
  const fontSizeStr = `${fontSize}pt`;

  const [level, setLevel] = useState<1 | 2>(1);

  const currentBadges = level === 1 ? BADGE_METADATA : BADGE_METADATA_LV2;
  const currentUnitGroups = level === 1 ? UNIT_GROUPS_LV1 : UNIT_GROUPS_LV2;

  const [characterType, setCharacterType] = useState<"robot" | "dog" | "game">("robot");
  const [isError, setIsError] = useState(false);

  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<{
    feedback: string;
    badgeIds: number[];
  } | null>(null);

  const [varName, setVarName] = useState<string>("");
  const [varValue, setVarValue] = useState<string>("");
  const [showVariable, setShowVariable] = useState(false);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);

  const { loading: pyLoading, error: pyError, executeCode, restart: restartPyodide } = usePyodide();

  const showSpeechBubble = useCallback((text: string, duration = 8000) => {
    setSpeechText(text);
    setShowSpeech(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      showSpeechBubble(
        `안녕, ${userName}! 나는 AI 코딩 친구야. 왼쪽에서 단원을 선택하고 예제를 불러오거나 코드를 직접 수정해봐! robot.move(2) 처럼 코드를 쓰면 내가 스테이지에서 직접 움직여!`,
        11000
      );
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const firstId = level === 1 ? 0 : 17;
    setSelectedConceptId(firstId);
    const example = curriculum[firstId];
    if (example?.exampleCode) setCode(example.exampleCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const handleRun = useCallback(async () => {
    if (runningRef.current || pyLoading) return;
    runningRef.current = true;
    setRunning(true);
    setHasRun(true);
    setShowSpeech(false);
    setCommands([]);
    setPendingFeedback(null);
    setShowVariable(false);
    setIsError(false);

    let stdout = "", stderr = "", success = false;
    try {
      ({ stdout, stderr, success } = await executeCode(code));
    } finally {
      runningRef.current = false;
    }
    setOutput(stdout);
    setExecError(stderr);
    setIsError(!success);
    if (stdout || stderr) setShowOutput(true);

    const parseResult = parsePython(code);
    const primary = parseResult.primaryConcept;

    if (success && primary && primary.conceptKey === "variable") {
      setVarName((primary.details.lastVarName as string) || "");
      setVarValue((primary.details.lastVarValue as string) || "");
      setShowVariable(true);
    }

    const queueCommands = animationQueue.get();
    setCommands(queueCommands);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdout, stderr, isSuccess: success }),
      });

      if (res.ok) {
        const data = await res.json();
        let feedback: string = data.feedback;
        const badgeIds: number[] = data.newlyEarnedBadgeIds;

        if (!success) {
          const friendlyExplanation = getFriendlyErrorExplanation(stderr);
          if (feedback.includes("코드에 오류가 있어요") || feedback.trim().length === 0) {
            feedback = friendlyExplanation;
          } else {
            feedback = `${friendlyExplanation}\n\n💡 힌트: ${feedback}`;
          }
        }

        if (success && queueCommands.length > 0) {
          setPendingFeedback({ feedback, badgeIds });
        } else {
          setPendingFeedback(null);
          showSpeechBubble(feedback);
          if (success && badgeIds.length > 0) {
            setNewBadgeIds(badgeIds);
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
  }, [pyLoading, code, executeCode, showSpeechBubble]);

  const handleAnimationComplete = useCallback(() => {
    if (pendingFeedback) {
      showSpeechBubble(pendingFeedback.feedback);
      if (pendingFeedback.badgeIds.length > 0) {
        setNewBadgeIds(pendingFeedback.badgeIds);
        setCommands([{ type: "dance", params: {} }]);
      }
      setPendingFeedback(null);
    }
  }, [pendingFeedback, showSpeechBubble]);

  const handleLoadExample = useCallback(() => {
    const example = curriculum[selectedConceptId];
    if (example) setCode(example.exampleCode);
  }, [selectedConceptId, curriculum]);

  const handleLoadPractice = useCallback(() => {
    const example = curriculum[selectedConceptId];
    if (example?.practiceCode) setCode(example.practiceCode);
  }, [selectedConceptId, curriculum]);

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
    setShowOutput(false);
  }, []);

  const currentConcept = curriculum[selectedConceptId];

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

      {pyError && (
        <section className="runtime-error-panel" role="alert" aria-live="assertive">
          <div>
            <strong>Python 실행 환경 오류</strong>
            <pre>{pyError}</pre>
          </div>
          <button type="button" onClick={restartPyodide}>실행 환경 다시 시작</button>
        </section>
      )}

      {/* 3-column workspace */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 14, padding: "10px 18px 18px" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div
          style={{
            width: 192,
            flex: "none",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #EFEAF8",
            boxShadow: "0 8px 24px rgba(90,63,214,.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 14px 10px",
              borderBottom: "1px solid #F2EDF9",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#B0A8CC",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            단원 목록
          </div>
          {/* Level toggle */}
          <div style={{ display: "flex", gap: 4, padding: "8px 8px 4px" }}>
            {([1, 2] as const).map((lv) => (
              <button
                key={lv}
                onClick={() => setLevel(lv)}
                style={{
                  flex: 1,
                  padding: "5px 0",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: 12,
                  fontWeight: 700,
                  background: level === lv ? "linear-gradient(135deg,#9B7FFF,#7B5CF0)" : "#F3EFFE",
                  color: level === lv ? "#fff" : "#9B7FFF",
                  transition: "all .13s",
                }}
              >
                Lv.{lv}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
            {currentUnitGroups.map((group) => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: group.color,
                    letterSpacing: 0.5,
                    padding: "6px 8px 3px",
                    textTransform: "uppercase",
                  }}
                >
                  {(() => { const Icon = GROUP_ICON_MAP[group.icon]; return Icon ? <Icon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : null; })()}
                  {group.label}
                </div>
                {group.ids.map((id) => {
                  const badge = currentBadges.find(b => b.conceptId === id);
                  if (!badge) return null;
                  const name = badge.nameKo.replace(" 마스터", "");
                  const selected = id === selectedConceptId;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setSelectedConceptId(id);
                        const example = curriculum[id];
                        if (example?.exampleCode) setCode(example.exampleCode);
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        display: "block",
                        padding: "7px 10px",
                        borderRadius: 10,
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: selected ? 700 : 500,
                        background: selected ? "linear-gradient(135deg,#9B7FFF,#7B5CF0)" : "transparent",
                        color: selected ? "#fff" : "#7A6FA0",
                        marginBottom: 1,
                        transition: "all .13s",
                        boxShadow: selected ? "0 3px 8px rgba(123,92,240,.22)" : "none",
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) e.currentTarget.style.background = "#F3EFFE";
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTER: Editor column ── */}
        <div style={{ flex: 1.2, minWidth: 0, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>

          {/* Concept explanation panel (collapsible) */}
          <div
            style={{
              flex: "none",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #EFEAF8",
              boxShadow: "0 4px 14px rgba(90,63,214,.05)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setConceptExpanded(!conceptExpanded)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: "#7B5CF0" }}>
                📖 {currentConcept.nameKo}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#9B7FFF",
                  background: "#F2ECFD",
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                {currentConcept.nameEn}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#C4BDD8",
                  transform: conceptExpanded ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform .2s",
                  display: "inline-block",
                }}
              >
                ▲
              </span>
            </button>
            {conceptExpanded && (
              <div
                style={{
                  padding: "0 16px 12px",
                  borderTop: "1px solid #F5F0FF",
                }}
              >
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13.5,
                    color: "#5C5480",
                    lineHeight: 1.65,
                  }}
                >
                  {currentConcept.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Code editor card */}
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
                padding: "11px 16px",
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
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                {/* Font size controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#F4F0FE", borderRadius: 8, padding: "2px 4px" }}>
                  <button
                    onClick={() => setFontSize(s => Math.max(7, s - 1))}
                    title="글자 크기 줄이기"
                    style={{ width: 22, height: 22, border: "none", background: "transparent", cursor: "pointer", color: "#7B5CF0", fontWeight: 700, fontSize: 14, lineHeight: 1, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >−</button>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#7B5CF0", minWidth: 28, textAlign: "center" }}>{fontSize}pt</span>
                  <button
                    onClick={() => setFontSize(s => Math.min(16, s + 1))}
                    title="글자 크기 키우기"
                    style={{ width: 22, height: 22, border: "none", background: "transparent", cursor: "pointer", color: "#7B5CF0", fontWeight: 700, fontSize: 14, lineHeight: 1, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >+</button>
                </div>
                <RobotApiTooltip />
              </div>
            </div>

            {/* Code editor */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <CodeEditor value={code} onChange={setCode} fontSize={fontSizeStr} />
            </div>

            {/* Action buttons */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                borderTop: "1px solid #F2EDF9",
              }}
            >
              {/* Run */}
              <button
                onClick={handleRun}
                disabled={running || pyLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "11px 0",
                  width: 110,
                  border: "none",
                  borderRadius: 13,
                  background: running || pyLoading
                    ? "linear-gradient(180deg,#5EC4A0,#3DAF88)"
                    : "linear-gradient(180deg,#34D9A6,#18C99A)",
                  color: "#fff",
                  fontFamily: "var(--font-jua), 'Jua', sans-serif",
                  fontSize: 15,
                  cursor: running || pyLoading ? "not-allowed" : "pointer",
                  boxShadow: running || pyLoading
                    ? "0 3px 0 #2A8A68"
                    : "0 5px 0 #0FA37C,0 8px 16px rgba(24,201,154,.28)",
                  opacity: running || pyLoading ? 0.8 : 1,
                  transition: "transform .12s,box-shadow .12s,opacity .15s",
                  animation: !hasRun && !running && !pyLoading ? "runPulse 1.8s ease-in-out infinite" : undefined,
                }}
                onMouseDown={(e) => {
                  if (!running && !pyLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #0FA37C";
                  }
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = running || pyLoading
                    ? "0 3px 0 #2A8A68"
                    : "0 5px 0 #0FA37C,0 8px 16px rgba(24,201,154,.28)";
                }}
              >
                {running ? (
                  <>
                    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 0.18, 0.36].map((delay, i) => (
                        <span key={i} style={{
                          width: 5, height: 5, borderRadius: "50%", background: "#fff",
                          display: "inline-block",
                          animation: `dotBounce 0.7s ${delay}s ease-in-out infinite`,
                        }} />
                      ))}
                    </span>
                    실행 중
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" stroke="none">
                      <path d="M7 4l13 8-13 8z" />
                    </svg>
                    실행
                  </>
                )}
              </button>

              {/* Load example */}
              <button
                onClick={handleLoadExample}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 16px",
                  border: "1.5px solid #ECE7F8",
                  borderRadius: 13,
                  background: "#fff",
                  color: "#7B5CF0",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                예제 불러오기
              </button>

              {/* Load practice */}
              <button
                onClick={handleLoadPractice}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 16px",
                  border: "1.5px solid #E8F5E9",
                  borderRadius: 13,
                  background: "#fff",
                  color: "#18C99A",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                문제 풀기
              </button>

              {/* Output toggle */}
              {hasRun && (
                <button
                  onClick={() => setShowOutput(!showOutput)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "11px 16px",
                    border: `1.5px solid ${showOutput ? "#7B5CF0" : "#ECE7F8"}`,
                    borderRadius: 13,
                    background: showOutput ? "#F2ECFD" : "#fff",
                    color: showOutput ? "#7B5CF0" : "#A39CC0",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .13s",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  결과 {showOutput ? "닫기" : "보기"}
                </button>
              )}

              {/* Reset */}
              <button
                onClick={handleReset}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 12px",
                  border: "none",
                  borderRadius: 11,
                  background: "transparent",
                  color: "#A39CC0",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .13s",
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
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
                </svg>
                초기화
              </button>

              {pyLoading && (
                <span style={{ fontSize: 11.5, color: "#A39CC0", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 11, height: 11, border: "2px solid #A39CC0", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                  파이썬 로드 중...
                </span>
              )}
              {pyError && <span role="alert" style={{ fontSize: 11.5, color: "#D93668" }}>{pyError}</span>}
            </div>
          </div>

          {/* ── FLOATING OUTPUT PANEL ── */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "44%",
              transform: showOutput ? "translateY(0)" : "translateY(105%)",
              transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              background: "#16172A",
              borderRadius: "18px 18px 0 0",
              boxShadow: showOutput ? "0 -8px 40px rgba(0,0,0,0.28)" : "none",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: showOutput ? "all" : "none",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderBottom: "1px solid #252640",
                background: "#1E1F36",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: execError ? "#FF5C8A" : "#18C99A",
                  display: "inline-block",
                  boxShadow: execError ? "0 0 6px #FF5C8A88" : "0 0 6px #18C99A88",
                }}
              />
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6B6B99" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6B6B99", letterSpacing: 0.5, textTransform: "uppercase" }}>
                실행 결과
              </span>
              <button
                onClick={() => setShowOutput(false)}
                style={{
                  marginLeft: "auto",
                  background: "transparent",
                  border: "none",
                  color: "#4A4A6A",
                  cursor: "pointer",
                  fontSize: 17,
                  lineHeight: 1,
                  padding: "2px 6px",
                  borderRadius: 6,
                  transition: "color .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#9B7FFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A6A")}
              >
                ✕
              </button>
            </div>

            {/* Output content */}
            <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>
              <OutputPanel output={output} error={execError} hasRun={hasRun} dark />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Robot column ── */}
        <div style={{ flex: 0.85, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
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
            {/* AI feedback bubble */}
            <div style={{ flex: "none", minHeight: 66, padding: "12px 14px 4px" }}>
              <div
                style={{
                  width: "100%",
                  background: showSpeech ? "#7B5CF0" : "#fff",
                  border: showSpeech ? "none" : "1.5px dashed #C9C1DE",
                  borderRadius: 14,
                  padding: "9px 13px",
                  boxShadow: showSpeech ? "0 6px 14px rgba(123,92,240,.22)" : "none",
                  transition: "all .3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: showSpeech ? "#fff" : "#8B83A8",
                    textAlign: "center",
                  }}
                >
                  {showSpeech ? speechText : "파이썬 코드를 작성하고 실행하면 여기에 힌트와 설명이 나타나요!"}
                </div>
              </div>
            </div>

            {/* Character selector */}
            <div style={{ flex: "none", display: "flex", justifyContent: "center", gap: 5, padding: "2px 14px 8px" }}>
              {(["robot", "dog", "game"] as const).map((type) => {
                const isSelected = characterType === type;
                const labels = { robot: "로봇", dog: "강아지", game: "전사" };
                const icons = { robot: Bot, dog: PawPrint, game: Sword };
                const Icon = icons[type];
                return (
                  <button
                    key={type}
                    onClick={() => setCharacterType(type)}
                    style={{
                      background: isSelected ? "linear-gradient(180deg,#8B6CFF,#7B5CF0)" : "#fff",
                      color: isSelected ? "#fff" : "#8B83A8",
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "5px 11px",
                      borderRadius: 9,
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 3px 8px rgba(123,92,240,.22)" : "none",
                      border: isSelected ? "none" : "1.5px solid #ECE7F8",
                      transition: "all 0.13s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon size={12} />
                    {labels[type]}
                  </button>
                );
              })}
            </div>

            {/* Robot stage */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: "0 14px 12px",
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
                  <div style={{ width: 38, height: 38, border: "3.5px solid #C6A2EC", borderTopColor: "#7B5CF0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 13, color: "#8B83A8", margin: 0, fontWeight: 700 }}>파이썬 엔진 로드 중...</p>
                  <p style={{ fontSize: 11.5, color: "#BDB6D4", margin: 0 }}>처음 준비할 때 약 10~30초 소요됩니다.</p>
                </div>
              )}

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

      {/* 제작사 로고 */}
      <div style={{ position: "fixed", bottom: 14, right: 18, zIndex: 5, opacity: 0.6 }}>
        <Image
          src="/lifeprofessor-logo.png"
          alt="인생교수의 AI 연구소"
          width={145}
          height={31}
          style={{ objectFit: "contain" }}
        />
      </div>
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
