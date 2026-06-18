"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { usePyodide } from "@/hooks/usePyodide";
import { useRobotState } from "@/hooks/useRobotState";
import { parsePython } from "@/lib/python-parser";
import RobotCharacter from "@/components/robot/RobotCharacter";
import RobotSpeechBubble from "@/components/robot/RobotSpeechBubble";
import VariableFloat from "@/components/robot/VariableFloat";
import ClassCharacters from "@/components/robot/ClassCharacters";
import OutputPanel from "@/components/editor/OutputPanel";
import BadgeCelebration from "@/components/badges/BadgeCelebration";
import Header from "@/components/layout/Header";
import { BADGE_METADATA, CONCEPT_EXAMPLES } from "@/lib/curriculum";
import { COLOR_HEX } from "@/components/badges/colorMap";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const INITIAL_CODE = `# 파이썬 코드를 여기에 입력하세요\nprint("안녕하세요!")\nprint("파이썬 학습 놀이터에 오신 것을 환영합니다.")\n`;

interface LearnClientProps { userName: string; }

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
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { loading: pyLoading, executeCode } = usePyodide();
  const { robotStateData, deriveAndPlay, celebrate } = useRobotState();

  const showSpeechBubble = useCallback((text: string, duration = 8000) => {
    setSpeechText(text); setShowSpeech(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration);
  }, []);

  const handleRun = useCallback(async () => {
    if (running || pyLoading) return;
    setRunning(true); setHasRun(true); setShowSpeech(false);
    const { stdout, stderr, success } = await executeCode(code);
    setOutput(stdout); setExecError(stderr);
    const parseResult = parsePython(code);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdout, stderr, isSuccess: success }),
      });
      if (res.ok) {
        const data = await res.json();
        const feedback: string = data.feedback;
        const badgeIds: number[] = data.newlyEarnedBadgeIds;
        deriveAndPlay(parseResult, success, feedback);
        showSpeechBubble(feedback);
        setEarnedConceptIds((prev) => {
          const next = new Set(prev);
          if (success) parseResult.concepts.forEach((c) => next.add(c.conceptId));
          return next;
        });
        if (badgeIds.length > 0) {
          setNewBadgeIds(badgeIds);
          setTimeout(() => celebrate(feedback), 1500);
        }
      }
    } catch {
      const fallback = success ? "잘 했어요! 코드가 실행되었습니다." : "오류가 있어요. 다시 확인해보세요.";
      deriveAndPlay(parseResult, success, fallback);
      showSpeechBubble(fallback);
    }
    setRunning(false);
  }, [running, pyLoading, code, executeCode, deriveAndPlay, celebrate, showSpeechBubble]);

  const handleLoadExample = useCallback(() => {
    const example = CONCEPT_EXAMPLES[selectedConceptId];
    if (example) setCode(example.exampleCode);
  }, [selectedConceptId]);

  const handleReset = useCallback(() => {
    setCode(INITIAL_CODE); setOutput(""); setExecError("");
    setHasRun(false); setShowSpeech(false);
  }, []);

  const classCharacters = (robotStateData.classCharacters || []) as ("warrior" | "archer")[];
  const showVariable = robotStateData.state === "talking" && !!robotStateData.variableName;
  const unitTitle = BADGE_METADATA[selectedConceptId - 1]?.nameKo.replace(" 마스터", "") || "출력";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden", background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)" }}>
      <Header />

      {/* Unit tabs */}
      <div style={{ flex: "none", padding: "12px 22px 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
          <span style={{ flex: "none", fontSize: 12.5, fontWeight: 700, color: "#A39CC0", marginRight: 2 }}>단원</span>
          {BADGE_METADATA.map((badge, idx) => {
            const cid = idx + 1;
            const selected = cid === selectedConceptId;
            return (
              <button
                key={cid}
                onClick={() => setSelectedConceptId(cid)}
                style={{
                  flex: "none", whiteSpace: "nowrap", border: "none", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  padding: "7px 14px", borderRadius: 99, transition: "all .15s",
                  ...(selected
                    ? { background: "linear-gradient(180deg,#8B6CFF,#7B5CF0)", color: "#fff", boxShadow: "0 4px 10px rgba(123,92,240,.34)" }
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
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#fff", borderRadius: 22, border: "1px solid #EFEAF8", boxShadow: "0 12px 30px rgba(90,63,214,.07)", overflow: "hidden" }}>
            {/* Editor titlebar */}
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "12px 18px", borderBottom: "1px solid #F2EDF9" }}>
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5C8A", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFC23C", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#18C99A", display: "inline-block" }} />
              <span style={{ fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 13, color: "#9A93B5", marginLeft: 6 }}>main.py</span>
              <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: "#7B5CF0", background: "#F2ECFD", padding: "4px 11px", borderRadius: 99 }}>
                {unitTitle} 단원
              </span>
            </div>

            {/* Code editor */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <CodeEditor value={code} onChange={setCode} />
            </div>

            {/* Output */}
            <div style={{ flex: "none", borderTop: "1px solid #F2EDF9", background: "#FAF8FF" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "10px 18px 6px", fontSize: 11.5, fontWeight: 700, letterSpacing: 0.3, color: "#A39CC0", textTransform: "uppercase" }}>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
                </svg>
                실행 결과
              </div>
              <OutputPanel output={output} error={execError} hasRun={hasRun} />
            </div>

            {/* Actions */}
            <div style={{ flex: "none", display: "flex", alignItems: "center", gap: 10, padding: "13px 18px", borderTop: "1px solid #F2EDF9" }}>
              <button
                onClick={handleRun}
                disabled={running || pyLoading}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", border: "none", borderRadius: 14, background: running || pyLoading ? "#5ED4AA" : "linear-gradient(180deg,#34D9A6,#18C99A)", color: "#fff", fontFamily: "var(--font-jua), 'Jua', sans-serif", fontSize: 15.5, cursor: running || pyLoading ? "not-allowed" : "pointer", boxShadow: "0 5px 0 #0FA37C,0 9px 18px rgba(24,201,154,.32)", transition: "transform .12s,box-shadow .12s" }}
                onMouseDown={(e) => { if (!running && !pyLoading) { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #0FA37C"; } }}
                onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 5px 0 #0FA37C,0 9px 18px rgba(24,201,154,.32)"; }}
              >
                {running ? (
                  <span style={{ width: 18, height: 18, border: "2.5px solid #fff", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff" stroke="none"><path d="M7 4l13 8-13 8z" /></svg>
                )}
                {running ? "실행 중..." : "실행"}
              </button>

              <button
                onClick={handleLoadExample}
                style={{ display: "flex", alignItems: "center", gap: 7, padding: "12px 18px", border: "1.5px solid #ECE7F8", borderRadius: 14, background: "#fff", color: "#7B5CF0", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                예제 불러오기
              </button>

              <button
                onClick={handleReset}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", border: "none", borderRadius: 12, background: "transparent", color: "#A39CC0", fontWeight: 600, fontSize: 13.5, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#7B5CF0"; (e.currentTarget as HTMLButtonElement).style.background = "#F6F2FE"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#A39CC0"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" /><path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
                </svg>
                초기화
              </button>

              {pyLoading && (
                <span style={{ fontSize: 12, color: "#A39CC0", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 12, height: 12, border: "2px solid #A39CC0", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                  파이썬 로드 중...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Robot column */}
        <div style={{ flex: 0.85, minWidth: 300, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "linear-gradient(165deg,#FBF7FF,#F3ECFE)", borderRadius: 22, border: "1px solid #EFEAF8", boxShadow: "0 12px 30px rgba(90,63,214,.07)", overflow: "hidden", position: "relative" }}>

            {/* Speech bubble area */}
            <div style={{ flex: "none", minHeight: 84, padding: "16px 18px 4px", display: "flex", justifyContent: "center" }}>
              <RobotSpeechBubble text={speechText} visible={showSpeech} />
            </div>

            {/* Robot stage */}
            <div style={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", flexDirection: "column", gap: 8 }}>
              {pyLoading && (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(251,247,255,.85)", gap: 12, zIndex: 2 }}>
                  <div style={{ width: 40, height: 40, border: "3.5px solid #C6A2EC", borderTopColor: "#7B5CF0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 13.5, color: "#8B83A8", margin: 0 }}>파이썬 엔진 로드 중...</p>
                  <p style={{ fontSize: 12, color: "#BDB6D4", margin: 0 }}>처음 로드 시 약 10~30초 소요돼요</p>
                </div>
              )}

              <div style={{ position: "relative" }}>
                <VariableFloat varName={robotStateData.variableName} varValue={robotStateData.variableValue} visible={showVariable} />
                <RobotCharacter state={robotStateData.state} size={userName ? 160 : 160} />
              </div>

              <ClassCharacters
                characters={classCharacters}
                visible={robotStateData.state === "celebrating" && classCharacters.length > 0}
              />
            </div>

            {/* Badge strip */}
            <div style={{ flex: "none", borderTop: "1px solid #ECE4FA", background: "rgba(255,255,255,.6)", padding: "13px 16px 15px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#8B83A8" }}>내 뱃지</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#7B5CF0", background: "#F2ECFD", padding: "3px 9px", borderRadius: 99 }}>
                  {earnedConceptIds.size} / 16
                </span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 6 }}>
                {BADGE_METADATA.map((badge, idx) => {
                  const cid = idx + 1;
                  const earned = earnedConceptIds.has(cid);
                  const hex = COLOR_HEX[badge.colorClass] || "#7B5CF0";
                  return (
                    <div
                      key={cid}
                      title={badge.nameKo}
                      style={{
                        aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 11,
                        ...(earned
                          ? { background: "#fff", border: `2px solid ${hex}33`, boxShadow: `0 3px 8px ${hex}22` }
                          : { background: "#F4F1FA", border: "2px dashed #E2DCF2" }),
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={earned ? hex : "#C9C1DE"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {earned ? <polyline points="4 17 10 11 4 5" /> : <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>}
                      </svg>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BadgeCelebration badgeIds={newBadgeIds} onClose={() => setNewBadgeIds([])} />
    </div>
  );
}
