/* global importScripts, loadPyodide */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";
let pyodidePromise;
let currentPhase = "Worker 시작";

function send(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

function errorDetails(error, phase = currentPhase) {
  return {
    phase,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack || "" : "",
  };
}

self.addEventListener("error", (event) => {
  event.preventDefault();
  send("worker-error", {
    ...errorDetails(event.error || event.message),
    filename: event.filename || "pyodide-worker.js",
    line: event.lineno || 0,
    column: event.colno || 0,
  });
});

self.addEventListener("unhandledrejection", (event) => {
  event.preventDefault();
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
  send("worker-error", { ...errorDetails(event.reason || reason) });
});

// Pyodide adds metadata such as `__all__` while registering a JS module,
// so this object must remain extensible.
const robot = {
  move: (steps = 1) => send("robot-command", { command: "move", args: [steps] }),
  turn: (direction) => send("robot-command", { command: "turn", args: [direction] }),
  jump: () => send("robot-command", { command: "jump", args: [] }),
  say: (text) => send("robot-command", { command: "say", args: [String(text)] }),
  emotion: (feeling) => send("robot-command", { command: "emotion", args: [feeling] }),
  dance: () => send("robot-command", { command: "dance", args: [] }),
  size: (scale = 1) => send("robot-command", { command: "size", args: [scale] }),
  draw: (shape) => send("robot-command", { command: "draw", args: [shape] }),
  clone: () => send("robot-command", { command: "clone", args: [] }),
};

async function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = (async () => {
      currentPhase = "Pyodide 스크립트 다운로드";
      importScripts(`${PYODIDE_URL}pyodide.js`);
      currentPhase = "Pyodide 런타임 초기화";
      const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      currentPhase = "robot JS 모듈 등록";
      pyodide.registerJsModule("robot", robot);
      currentPhase = "실행 대기";
      return pyodide;
    })();
  }
  return pyodidePromise;
}

async function execute(id, code) {
  try {
    currentPhase = "Python 실행 환경 준비";
    const pyodide = await getPyodide();
    pyodide.globals.set('_user_code', code);

    currentPhase = "사용자 Python 코드 실행";
    await pyodide.runPythonAsync(`
import sys, io, time, traceback as _tb
time.sleep = lambda _: None
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
_exec_success = True
_exec_error = ""
try:
    exec(compile(_user_code, '<main.py>', 'exec'))
except Exception:
    _exec_success = False
    _exec_error = _tb.format_exc()
`);

    const success = Boolean(pyodide.globals.get('_exec_success'));
    const rawError = String(pyodide.globals.get('_exec_error') || '');

    let stderr = "";
    if (!success && rawError) {
      // Filter internal Pyodide frames (<exec>, <string>) from traceback
      const lines = rawError.split('\n');
      stderr = lines.filter(line => !/File "<(exec|string)>"/.test(line)).join('\n').trim();
    }

    const stdout = String(await pyodide.runPythonAsync(`
_output = _stdout_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_output
`));
    currentPhase = "실행 대기";
    send("result", { id, stdout: stdout.trim(), stderr, success });
  } catch (error) {
    send("result", {
      id,
      stdout: "",
      stderr: `[${currentPhase}]\n${error instanceof Error ? (error.message || String(error)) : String(error)}`,
      success: false,
    });
  }
}

self.onmessage = (event) => {
  const message = event.data;
  if (message?.type === "init") {
    getPyodide()
      .then(() => send("ready"))
      .catch((error) => send("init-error", errorDetails(error)));
  } else if (message?.type === "execute") {
    void execute(message.id, String(message.code ?? ""));
  }
};
