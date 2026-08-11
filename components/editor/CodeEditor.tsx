"use client";

import { useEffect, useRef } from "react";
import { EditorView, basicSetup } from "codemirror";
import { python } from "@codemirror/lang-python";
import { EditorState, Compartment } from "@codemirror/state";

const baseTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "#FCFBFF" },
  ".cm-scroller": {
    overflow: "auto",
    fontFamily: "Consolas, 'JetBrains Mono', monospace",
    lineHeight: "1.5",
  },
  ".cm-content": { padding: "12px 0" },
  ".cm-line": { padding: "0 16px" },
  ".cm-gutters": { backgroundColor: "#FCFBFF", borderRight: "1px solid #EEE8FA", minWidth: "42px" },
  ".cm-gutterElement": { color: "#CBC3E2", fontFamily: "Consolas, monospace" },
  ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 4px", minWidth: "36px", textAlign: "right" },
  ".cm-activeLineGutter": { backgroundColor: "#F5F1FD !important" },
  ".cm-activeLine": { backgroundColor: "#F5F1FD" },
  ".cm-cursor": { borderLeftColor: "#7B5CF0", borderLeftWidth: "2px" },
  ".cm-selectionBackground, ::selection": { backgroundColor: "#DDD0FA !important" },
  ".cm-focused .cm-selectionBackground": { backgroundColor: "#DDD0FA !important" },
});

function fontSizeTheme(size: string) {
  return EditorView.theme({
    ".cm-scroller": { fontSize: size },
  });
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  readOnly?: boolean;
  fontSize?: string;
}

export default function CodeEditor({ value, onChange, onCursorChange, readOnly = false, fontSize = "9pt" }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const onCursorChangeRef = useRef(onCursorChange);
  const fontCompartment = useRef(new Compartment());
  onChangeRef.current = onChange;
  onCursorChangeRef.current = onCursorChange;

  useEffect(() => {
    if (!containerRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        python(),
        baseTheme,
        fontCompartment.current.of(fontSizeTheme(fontSize)),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString());
          if (update.docChanged || update.selectionSet) {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            onCursorChangeRef.current?.({
              line: line.number,
              column: head - line.from + 1,
            });
          }
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

  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: fontCompartment.current.reconfigure(fontSizeTheme(fontSize)),
    });
  }, [fontSize]);

  return <div ref={containerRef} style={{ height: "100%", width: "100%", overflow: "hidden" }} />;
}
