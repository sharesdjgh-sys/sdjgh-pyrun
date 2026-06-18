"use client";

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

  return (
    <div style={{ height: 120, overflow: "auto", padding: "12px 18px" }}>
      {output && (
        <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6, color: "#16A37B", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {output}
        </pre>
      )}
      {error && (
        <pre style={{ margin: 0, fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace", fontSize: 14, lineHeight: 1.6, color: "#E23E70", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {error}
        </pre>
      )}
      {!output && !error && (
        <span style={{ color: "#BDB6D4", fontSize: 13.5 }}>(출력 없음)</span>
      )}
    </div>
  );
}
