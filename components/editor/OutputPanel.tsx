"use client";

import { AlertTriangle, FileOutput, Inbox, Lightbulb } from "lucide-react";

const ERROR_HINTS: { pattern: RegExp; type: string; hint: string }[] = [
  { pattern: /IndentationError/, type: "IndentationError", hint: "들여쓰기가 잘못됐어요. 스페이스 4칸을 일관되게 써야 해요." },
  { pattern: /SyntaxError/, type: "SyntaxError", hint: "문법 오류예요. 괄호나 콜론(:)이 빠지지 않았나요?" },
  { pattern: /NameError/, type: "NameError", hint: "변수나 함수 이름이 정의되지 않았어요. 이름을 확인해보세요." },
  { pattern: /TypeError/, type: "TypeError", hint: "데이터 타입이 맞지 않아요. 숫자와 문자열을 섞어 쓰진 않았나요?" },
  { pattern: /ZeroDivisionError/, type: "ZeroDivisionError", hint: "0으로 나눌 수 없어요." },
  { pattern: /IndexError/, type: "IndexError", hint: "리스트 인덱스가 범위를 벗어났어요. 길이를 확인해보세요." },
  { pattern: /KeyError/, type: "KeyError", hint: "딕셔너리에 해당 키가 없어요." },
  { pattern: /AttributeError/, type: "AttributeError", hint: "해당 속성이나 메서드가 없어요." },
  { pattern: /ValueError/, type: "ValueError", hint: "값이 잘못됐어요. 변환하려는 데이터를 확인해보세요." },
  { pattern: /ImportError|ModuleNotFoundError/, type: "ImportError", hint: "모듈을 불러올 수 없어요. 모듈 이름을 확인해보세요." },
  { pattern: /RecursionError/, type: "RecursionError", hint: "무한 재귀 호출이 발생했어요. 종료 조건을 확인해보세요." },
];

function getErrorHint(stderr: string): { type: string; hint: string } | null {
  for (const e of ERROR_HINTS) {
    if (e.pattern.test(stderr)) return { type: e.type, hint: e.hint };
  }
  return null;
}

interface OutputPanelProps {
  output: string;
  error: string;
  hasRun: boolean;
}

export default function OutputPanel({ output, error, hasRun }: OutputPanelProps) {
  if (!hasRun) {
    return (
      <div style={{ minHeight: 132, display: "grid", placeItems: "center", color: "#948BAE", textAlign: "center" }}>
        <div>
          <span style={{ width: 44, height: 44, margin: "0 auto 10px", display: "grid", placeItems: "center", borderRadius: 14, background: "#F1EDFA", color: "#8B74CD" }}>
            <FileOutput size={21} />
          </span>
          <strong style={{ display: "block", marginBottom: 4, color: "#5F5777", fontSize: 13.5 }}>아직 실행한 코드가 없어요</strong>
          <span style={{ fontSize: 12.5 }}>실행 버튼을 누르면 결과가 여기에 나타나요.</span>
        </div>
      </div>
    );
  }

  const errorHint = error ? getErrorHint(error) : null;
  const outputLines = output ? output.split(/\r?\n/) : [];
  if (outputLines.at(-1) === "") outputLines.pop();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {output && (
        <section
          aria-label="프로그램 출력"
          style={{
            overflow: "hidden",
            border: "1px solid #E8E2F4",
            borderRadius: 15,
            background: "#FFFFFF",
            boxShadow: "0 6px 18px rgba(76, 55, 130, .06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 13px", borderBottom: "1px solid #EEEAF6", background: "linear-gradient(90deg,#F8F5FE,#FBFAFE)", color: "#655A82", fontSize: 11.5, fontWeight: 800 }}>
            <FileOutput size={14} color="#7B5CF0" />
            출력 내용
            <span style={{ marginLeft: "auto", color: "#A49CB8", fontWeight: 600 }}>{outputLines.length}줄</span>
          </div>
          <div style={{ padding: "8px 0" }}>
            {outputLines.map((line, index) => (
              <div
                key={`${index}-${line}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "38px minmax(0, 1fr)",
                  minHeight: 26,
                  alignItems: "start",
                }}
              >
                <span aria-hidden="true" style={{ padding: "3px 10px 3px 0", borderRight: "1px solid #F0ECF7", color: "#C0B8D1", fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.65, textAlign: "right", userSelect: "none" }}>
                  {index + 1}
                </span>
                <pre style={{ margin: 0, padding: "3px 14px", color: "#353047", fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 13, fontWeight: 550, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {line || " "}
                </pre>
              </div>
            ))}
          </div>
        </section>
      )}
      {error && (
        <section
          aria-label="실행 오류"
          style={{
            padding: 13,
            border: "1px solid #F4CED9",
            borderRadius: 15,
            background: "linear-gradient(145deg,#FFF8FA,#FFF4F7)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: errorHint ? 10 : 8, color: "#C72F62", fontSize: 12.5, fontWeight: 800 }}>
            <AlertTriangle size={16} />
            코드를 실행하지 못했어요
          </div>
          {errorHint && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 10, padding: "9px 11px", borderRadius: 11, background: "#FFFFFFB8", color: "#8D3455" }}>
              <Lightbulb size={16} color="#D94F7B" style={{ flexShrink: 0, marginTop: 1 }} />
              <div style={{ minWidth: 0 }}>
                <strong style={{ display: "block", marginBottom: 2, fontSize: 11.5 }}>{errorHint.type}</strong>
                <span style={{ fontSize: 12.5, lineHeight: 1.5 }}>{errorHint.hint}</span>
              </div>
            </div>
          )}
          <pre style={{ margin: 0, padding: "10px 12px", overflow: "auto", borderRadius: 10, background: "#491E30", color: "#FFD5E1", fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 11.5, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {error}
          </pre>
        </section>
      )}
      {!output && !error && (
        <div style={{ minHeight: 132, display: "grid", placeItems: "center", color: "#948BAE", textAlign: "center" }}>
          <div>
            <span style={{ width: 44, height: 44, margin: "0 auto 10px", display: "grid", placeItems: "center", borderRadius: 14, background: "#F1EDFA", color: "#8B74CD" }}>
              <Inbox size={21} />
            </span>
            <strong style={{ display: "block", marginBottom: 4, color: "#5F5777", fontSize: 13.5 }}>코드는 정상적으로 실행됐어요</strong>
            <span style={{ fontSize: 12.5 }}>화면에 표시할 출력 내용은 없어요.</span>
          </div>
        </div>
      )}
    </div>
  );
}
