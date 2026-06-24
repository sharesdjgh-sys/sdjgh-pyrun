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

function formatWorkerError(message: Record<string, unknown>) {
  const phase = String(message.phase || "알 수 없는 단계");
  const detail = String(message.message || "알 수 없는 오류");
  const location = message.filename
    ? `\n위치: ${message.filename}:${message.line || 0}:${message.column || 0}`
    : "";
  const stack = message.stack ? `\n상세:\n${String(message.stack)}` : "";
  return `발생 단계: ${phase}\n원인: ${detail}${location}${stack}`;
}

export function usePyodide() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<number, PendingExecution>>(new Map());
  const sequenceRef = useRef(0);

  const createWorker = useCallback(() => {
    const worker = new Worker("/pyodide-worker.js?v=4");
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
        setError(formatWorkerError(message));
        setLoading(false);
        return;
      }
      if (message?.type === "worker-error") {
        const formatted = formatWorkerError(message);
        setError(formatted);
        for (const [id, pending] of pendingRef.current) {
          clearTimeout(pending.timer);
          pending.resolve({ stdout: "", stderr: formatted, success: false });
          pendingRef.current.delete(id);
        }
        return;
      }
      if (message?.type === "robot-command" && ROBOT_COMMANDS.has(message.command)) {
        try {
          const command = robotApi[message.command as keyof typeof robotApi] as (...args: unknown[]) => void;
          command(...(Array.isArray(message.args) ? message.args : []));
        } catch (commandError) {
          const detail = commandError instanceof Error ? commandError.message : String(commandError);
          setError(`발생 단계: robot.${message.command} 명령 검증\n원인: ${detail}`);
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

    worker.onerror = (event) => {
      const location = event.filename ? ` (${event.filename}:${event.lineno})` : "";
      const formatted = `발생 단계: Worker 스크립트 로드/실행\n원인: ${event.message || "브라우저가 상세 원인을 제공하지 않았습니다."}${location}`;
      setError(formatted);
      for (const [id, pending] of pendingRef.current) {
        clearTimeout(pending.timer);
        pending.resolve({ stdout: "", stderr: formatted, success: false });
        pendingRef.current.delete(id);
      }
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

  const restart = useCallback(() => {
    workerRef.current?.terminate();
    createWorker();
  }, [createWorker]);

  return { loading, error, executeCode, restart };
}
