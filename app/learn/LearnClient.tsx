"use client";

import { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { Play, RefreshCw, BookOpen, Loader2 } from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import { useRobotState } from "@/hooks/useRobotState";
import { parsePython } from "@/lib/python-parser";
import RobotCharacter from "@/components/robot/RobotCharacter";
import RobotSpeechBubble from "@/components/robot/RobotSpeechBubble";
import VariableFloat from "@/components/robot/VariableFloat";
import ClassCharacters from "@/components/robot/ClassCharacters";
import OutputPanel from "@/components/editor/OutputPanel";
import BadgeCelebration from "@/components/badges/BadgeCelebration";
import BadgeCard from "@/components/badges/BadgeCard";
import Header from "@/components/layout/Header";
import { BADGE_METADATA, CONCEPT_EXAMPLES } from "@/lib/curriculum";

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const INITIAL_CODE = `# 파이썬 코드를 여기에 입력하세요
print("안녕하세요!")
print("파이썬 학습 서비스에 오신 것을 환영합니다.")
`;

interface LearnClientProps {
  userName: string;
}

export default function LearnClient({ userName: _userName }: LearnClientProps) {
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

  const showSpeechBubble = useCallback((text: string, duration: number = 8000) => {
    setSpeechText(text);
    setShowSpeech(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration);
  }, []);

  const handleRun = useCallback(async () => {
    if (running || pyLoading) return;
    setRunning(true);
    setHasRun(true);
    setShowSpeech(false);

    const { stdout, stderr, success } = await executeCode(code);
    setOutput(stdout);
    setExecError(stderr);

    const parseResult = parsePython(code);

    // Call AI feedback API
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, stdout, stderr, isSuccess: success }),
      });
      if (res.ok) {
        const data = await res.json();
        const feedback: string = data.feedback;
        const badgeIds: number[] = data.newlyEarnedBadgeIds;

        deriveAndPlay(parseResult, success, feedback);
        showSpeechBubble(feedback);

        if (badgeIds.length > 0) {
          setNewBadgeIds(badgeIds);
          setEarnedConceptIds((prev) => {
            const next = new Set(prev);
            parseResult.concepts.forEach((c) => next.add(c.conceptId));
            return next;
          });
          setTimeout(() => celebrate(feedback), 1500);
        } else {
          setEarnedConceptIds((prev) => {
            const next = new Set(prev);
            parseResult.concepts.forEach((c) => {
              if (success) next.add(c.conceptId);
            });
            return next;
          });
        }
      }
    } catch {
      const fallback = success ? "잘 했어요! 코드가 실행되었습니다." : "오류가 있어요. 다시 확인해보세요.";
      deriveAndPlay(parseResult, success, fallback);
      showSpeechBubble(fallback);
    }

    setRunning(false);
  }, [running, pyLoading, code, executeCode, deriveAndPlay, celebrate, showSpeechBubble]);

  const handleLoadExample = useCallback(async () => {
    const example = CONCEPT_EXAMPLES[selectedConceptId];
    if (example) setCode(example.exampleCode);
  }, [selectedConceptId]);

  const handleReset = useCallback(() => {
    setCode(INITIAL_CODE);
    setOutput("");
    setExecError("");
    setHasRun(false);
    setShowSpeech(false);
  }, []);

  const classCharacters = (robotStateData.classCharacters || []) as ("warrior" | "archer")[];
  const showVariable =
    robotStateData.state === "talking" && !!robotStateData.variableName;

  return (
    <div className="flex flex-col h-screen bg-[#0f1117]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Code Editor */}
        <div className="flex flex-col w-[55%] border-r border-[#2d3148]">
          {/* Concept selector */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-[#2d3148] bg-[#1a1d27] overflow-x-auto shrink-0">
            <span className="text-slate-500 text-xs shrink-0">단원:</span>
            <div className="flex gap-1">
              {BADGE_METADATA.map((badge, idx) => {
                const cid = idx + 1;
                return (
                  <button
                    key={cid}
                    onClick={() => setSelectedConceptId(cid)}
                    className={`text-xs px-2 py-0.5 rounded transition-colors shrink-0 ${
                      selectedConceptId === cid
                        ? "bg-blue-600 text-white"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {badge.nameKo.replace(" 마스터", "")}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={setCode} />
          </div>

          {/* Output */}
          <div className="border-t border-[#2d3148] bg-[#0d1117]">
            <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#2d3148]">
              <span className="text-xs text-slate-500">실행 결과</span>
            </div>
            <OutputPanel output={output} error={execError} hasRun={hasRun} />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-t border-[#2d3148] bg-[#1a1d27] shrink-0">
            <button
              onClick={handleRun}
              disabled={running || pyLoading}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:bg-green-900 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              {running ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Play size={15} />
              )}
              {running ? "실행 중..." : "실행"}
            </button>
            <button
              onClick={handleLoadExample}
              className="flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <BookOpen size={15} />
              예제 불러오기
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 rounded-lg px-3 py-2 text-sm transition-colors"
            >
              <RefreshCw size={15} />
              초기화
            </button>
            {pyLoading && (
              <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                <Loader2 size={12} className="animate-spin" />
                파이썬 로드 중...
              </span>
            )}
          </div>
        </div>

        {/* Right: Robot Panel */}
        <div className="flex flex-col w-[45%] bg-[#131620]">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 relative">
            {/* Speech bubble */}
            <div className="w-full max-w-xs flex justify-center min-h-[70px]">
              <RobotSpeechBubble text={speechText} visible={showSpeech} />
            </div>

            {/* Robot */}
            <div className="relative">
              {showVariable && (
                <VariableFloat
                  varName={robotStateData.variableName}
                  varValue={robotStateData.variableValue}
                  visible={showVariable}
                />
              )}
              <RobotCharacter state={robotStateData.state} size={150} />
            </div>

            {/* Class characters */}
            <ClassCharacters
              characters={classCharacters}
              visible={robotStateData.state === "celebrating" && classCharacters.length > 0}
            />

            {/* Pyodide loading state */}
            {pyLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#131620]/80 rounded-xl gap-3">
                <Loader2 size={36} className="text-blue-400 animate-spin" />
                <p className="text-slate-400 text-sm">파이썬 엔진 로드 중...</p>
                <p className="text-slate-600 text-xs">처음 로드 시 약 10~30초 소요됩니다</p>
              </div>
            )}
          </div>

          {/* Badge mini display */}
          <div className="border-t border-[#2d3148] p-3">
            <p className="text-xs text-slate-500 mb-2">획득한 뱃지 ({earnedConceptIds.size}/16)</p>
            <div className="grid grid-cols-8 gap-1">
              {BADGE_METADATA.map((badge, idx) => {
                const cid = idx + 1;
                return (
                  <BadgeCard
                    key={cid}
                    nameKo={badge.nameKo}
                    iconName={badge.iconName}
                    colorClass={badge.colorClass}
                    earned={earnedConceptIds.has(cid)}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Badge celebration overlay */}
      <BadgeCelebration
        badgeIds={newBadgeIds}
        onClose={() => setNewBadgeIds([])}
      />
    </div>
  );
}
