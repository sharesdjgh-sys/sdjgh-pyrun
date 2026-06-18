"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { EditorState } from "@codemirror/state";

const lightTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "#FCFBFF" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
    fontSize: "14px",
    lineHeight: "1.85",
  },
  ".cm-content": { padding: "12px 0" },
  ".cm-line": { padding: "0 16px" },
  ".cm-gutters": { backgroundColor: "#FCFBFF", borderRight: "1px solid #EEE8FA", minWidth: "42px" },
  ".cm-gutterElement": { padding: "0 12px 0 6px", color: "#CBC3E2", fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace" },
  ".cm-activeLineGutter": { backgroundColor: "#F5F1FD !important" },
  ".cm-activeLine": { backgroundColor: "#F5F1FD" },
  ".cm-cursor": { borderLeftColor: "#7B5CF0", borderLeftWidth: "2px" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "#DDD0FA !important" },
  ".cm-focused .cm-selectionBackground": { backgroundColor: "#DDD0FA !important" },
});

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export default function CodeEditor({ value, onChange, readOnly = false }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        lightTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
        }),
        EditorState.readOnly.of(readOnly),
      ],
    });
    viewRef.current = new EditorView({ state, parent: containerRef.current });
    return () => { viewRef.current?.destroy(); viewRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!viewRef.current) return;
    const current = viewRef.current.state.doc.toString();
    if (current !== value) {
      viewRef.current.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    }
  }, [value]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%", overflow: "hidden" }} />;
}
