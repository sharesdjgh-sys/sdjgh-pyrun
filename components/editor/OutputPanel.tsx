"use client";

import { Terminal } from "lucide-react";

interface OutputPanelProps {
  output: string;
  error: string;
  hasRun: boolean;
}

export default function OutputPanel({ output, error, hasRun }: OutputPanelProps) {
  if (!hasRun) {
    return (
      <div className="h-28 flex items-center justify-center text-slate-600 text-sm gap-2">
        <Terminal size={16} />
        <span>실행 버튼을 눌러보세요</span>
      </div>
    );
  }

  return (
    <div className="h-28 overflow-y-auto font-mono text-sm p-3">
      {output && (
        <pre className="text-green-400 whitespace-pre-wrap break-words">{output}</pre>
      )}
      {error && (
        <pre className="text-red-400 whitespace-pre-wrap break-words">{error}</pre>
      )}
      {!output && !error && (
        <span className="text-slate-500">(출력 없음)</span>
      )}
    </div>
  );
}
