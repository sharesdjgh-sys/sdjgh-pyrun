"use client";

import { useState, useEffect, useRef } from "react";
import { robotApi } from "@/lib/robot-api";
import { animationQueue } from "@/lib/animation-queue";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
  registerJsModule: (name: string, obj: any) => void;
}

interface ExecuteResult {
  stdout: string;
  stderr: string;
  success: boolean;
}

declare global {
  interface Window {
    __pyodidePromise?: Promise<PyodideInterface>;
    loadPyodide?: (options: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

export function usePyodide() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.__pyodidePromise) {
      window.__pyodidePromise = new Promise<PyodideInterface>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
        script.crossOrigin = "anonymous";
        script.onload = () => {
          if (window.loadPyodide) {
            window
              .loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/" })
              .then(resolve)
              .catch(reject);
          } else {
            reject(new Error("loadPyodide not found"));
          }
        };
        script.onerror = () => reject(new Error("Pyodide 스크립트 로드 실패"));
        document.head.appendChild(script);
      });
    }

    window.__pyodidePromise
      .then((py) => {
        py.registerJsModule("robot", robotApi);
        pyodideRef.current = py;
        setLoading(false);
      })
      .catch((err) => {
        setError(String(err));
        setLoading(false);
      });
  }, []);

  async function executeCode(code: string): Promise<ExecuteResult> {
    if (!pyodideRef.current) {
      return { stdout: "", stderr: "Pyodide가 아직 로드 중입니다.", success: false };
    }

    const py = pyodideRef.current;

    // 실행 전 이전 애니메이션 큐 초기화
    animationQueue.clear();

    try {
      try {
        await py.loadPackagesFromImports(code);
      } catch {
        // Some packages are not available in Pyodide — ignore
      }

      await py.runPythonAsync(`
import sys
import io
import time

time.sleep = lambda s: None
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

      let success = true;
      let stderr = "";

      try {
        await py.runPythonAsync(code);
      } catch (e) {
        success = false;
        stderr = String(e);
      }

      const stdout = String(
        await py.runPythonAsync(`
_out = _stdout_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_out
`)
      );

      return { stdout: stdout.trim(), stderr: stderr.trim(), success };
    } catch (e) {
      return { stdout: "", stderr: String(e), success: false };
    }
  }

  return { loading, error, executeCode };
}

