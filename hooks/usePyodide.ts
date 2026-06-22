"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animationQueue } from "@/lib/animation-queue";
import { robotApi } from "@/lib/robot-api";

interface ExecuteResult {
  stdout: string;
  stderr: string;
  success: boolean;
  timedOut?: boolean;
}

interface PendingExecution {
  resolve: (result: ExecuteResult) => void;
  timer: ReturnType<typeof setTimeout>;
}

const EXECUTION_TIMEOUT_MS = 5_000;
const ROBOT_COMMANDS = new Set(Object.keys(robotApi));

export function usePyodide() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, PendingExecution>>(new Map());
  const sequenceRef = useRef(0);

  const createWorker = useCallback(() => {
    const worker = new Worker("/pyodide-worker.js");
    workerRef.current = worker;
    setLoading(true);
    setError(null);

    worker.onmessage = (event: MessageEvent) => {
      const message = event.data;
      if (message?.type === "ready") {
        setLoading(false);
        return;
      }
      if (message?.type === "init-error") {
        setError(message.error || "Pyodide를 불러오지 못했습니다.");
        setLoading(false);
        return;
      }
      if (message?.type === "robot-command" && ROBOT_COMMANDS.has(message.command)) {
        try {
          const command = robotApi[message.command as keyof typeof robotApi] as (...args: unknown[]) => void;
          command(...(Array.isArray(message.args) ? message.args : []));
        } catch (commandError) {
          console.error("Invalid robot command", commandError);
        }
        return;
      }
      if (message?.type === "result") {
        const pending = pendingRef.current.get(message.id);
        if (!pending) return;
        clearTimeout(pending.timer);
        pendingRef.current.delete(message.id);
        pending.resolve({
          stdout: String(message.stdout ?? ""),
          stderr: String(message.stderr ?? ""),
          success: Boolean(message.success),
        });
      }
    };

    worker.onerror = () => {
      setError("Python 실행 Worker에서 오류가 발생했습니다.");
      setLoading(false);
    };
    worker.postMessage({ type: "init" });
    return worker;
  }, []);

  useEffect(() => {
    const worker = createWorker();
    const pendingExecutions = pendingRef.current;
    return () => {
      worker.terminate();
      for (const pending of pendingExecutions.values()) {
        clearTimeout(pending.timer);
        pending.resolve({ stdout: "", stderr: "실행이 취소되었습니다.", success: false });
      }
      pendingExecutions.clear();
    };
  }, [createWorker]);

  const executeCode = useCallback(async (code: string): Promise<ExecuteResult> => {
    const worker = workerRef.current;
    if (!worker || loading) {
      return { stdout: "", stderr: "Pyodide가 아직 로드 중입니다.", success: false };
    }

    animationQueue.clear();
    const id = ++sequenceRef.current;
    return new Promise<ExecuteResult>((resolve) => {
      const timer = setTimeout(() => {
        pendingRef.current.delete(id);
        worker.terminate();
        resolve({
          stdout: "",
          stderr: `실행 제한 시간(${EXECUTION_TIMEOUT_MS / 1000}초)을 초과했습니다. 무한 반복을 확인해주세요.`,
          success: false,
          timedOut: true,
        });
        createWorker();
      }, EXECUTION_TIMEOUT_MS);

      pendingRef.current.set(id, { resolve, timer });
      worker.postMessage({ type: "execute", id, code });
    });
  }, [createWorker, loading]);

  return { loading, error, executeCode };
}
