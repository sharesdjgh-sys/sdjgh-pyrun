"use client";

import { useState, useEffect, useRef } from "react";

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackagesFromImports: (code: string) => Promise<void>;
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
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/pyodide.js";
      script.crossOrigin = "anonymous";
      script.onload = () => {
        if (window.loadPyodide) {
          window.__pyodidePromise = window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
          });
        }
      };
      document.head.appendChild(script);
      window.__pyodidePromise = new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.loadPyodide) {
            window.loadPyodide({
              indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/",
            }).then(resolve).catch(reject);
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

    try {
      // Load packages from imports in the code
      try {
        await py.loadPackagesFromImports(code);
      } catch {
        // Some packages are not available in Pyodide — ignore
      }

      // Setup: redirect stdout, patch time.sleep
      await py.runPythonAsync(`
import sys
import io
import time

time.sleep = lambda s: None
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
_exec_error = None
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
