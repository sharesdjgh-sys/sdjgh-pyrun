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
  dark?: boolean;
}

export default function OutputPanel({ output, error, hasRun, dark = false }: OutputPanelProps) {
  const muted = dark ? "#4A4A6A" : "#BDB6D4";
  const outputColor = dark ? "#4ECCA3" : "#16A37B";
  const errorColor = dark ? "#FF6B9A" : "#E23E70";
  const errorHintText = dark ? "#FF8FAE" : "#C0286A";

  if (!hasRun) {
    return (
      <div style={{ padding: "4px 0", color: muted, fontSize: 13.5 }}>
        실행 버튼을 눌러 코드를 실행해 보세요.
      </div>
    );
  }

  const errorHint = error ? getErrorHint(error) : null;

  return (
    <div style={{ padding: "4px 0" }}>
      {output && (
        <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 13.5, lineHeight: 1.7, color: outputColor, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {output}
        </pre>
      )}
      {error && (
        <div style={{ marginTop: output ? 12 : 0 }}>
          {errorHint && (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
              <span style={{ flexShrink: 0, fontSize: 11, fontWeight: 700, color: "#fff", background: errorColor, borderRadius: 6, padding: "2px 8px", lineHeight: "20px" }}>
                {errorHint.type}
              </span>
              <span style={{ fontSize: 13, color: errorHintText, lineHeight: 1.5 }}>{errorHint.hint}</span>
            </div>
          )}
          <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 12.5, lineHeight: 1.6, color: errorColor, whiteSpace: "pre-wrap", wordBreak: "break-word", opacity: 0.85 }}>
            {error}
          </pre>
        </div>
      )}
      {!output && !error && (
        <span style={{ color: muted, fontSize: 13.5 }}>(출력 없음)</span>
      )}
    </div>
  );
}
