"use client";

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
      <div style={{ height: 120, display: "flex", alignItems: "center", padding: "0 18px", color: "#BDB6D4", fontSize: 13.5 }}>
        실행 버튼을 눌러 코드를 실행해 보세요.
      </div>
    );
  }

  const errorHint = error ? getErrorHint(error) : null;

  return (
    <div style={{ height: 120, overflow: "auto", padding: "12px 18px" }}>
      {output && (
        <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6, color: "#16A37B", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {output}
        </pre>
      )}
      {error && (
        <div>
          {errorHint && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff", background: "#E23E70", borderRadius: 6, padding: "2px 8px" }}>
                {errorHint.type}
              </span>
              <span style={{ fontSize: 13, color: "#C0286A", lineHeight: 1.4 }}>{errorHint.hint}</span>
            </div>
          )}
          <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 12, lineHeight: 1.5, color: "#E23E70", whiteSpace: "pre-wrap", wordBreak: "break-word", opacity: 0.7 }}>
            {error}
          </pre>
        </div>
      )}
      {!output && !error && (
        <span style={{ color: "#BDB6D4", fontSize: 13.5 }}>(출력 없음)</span>
      )}
    </div>
  );
}
