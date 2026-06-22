/* global importScripts, loadPyodide */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";
let pyodidePromise;

function send(type, payload = {}) {
  self.postMessage({ type, ...payload });
}

self.addEventListener("error", (event) => {
  send("worker-error", {
    error: `${event.message || "알 수 없는 Worker 오류"} (${event.filename || "worker"}:${event.lineno || 0})`,
  });
});

self.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason instanceof Error ? event.reason.message : String(event.reason);
  send("worker-error", { error: reason });
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
      importScripts(`${PYODIDE_URL}pyodide.js`);
      const pyodide = await loadPyodide({ indexURL: PYODIDE_URL });
      pyodide.registerJsModule("robot", robot);
      return pyodide;
    })();
  }
  return pyodidePromise;
}

async function execute(id, code) {
  try {
    const pyodide = await getPyodide();
    await pyodide.runPythonAsync(`
import sys
import io
import time
time.sleep = lambda _seconds: None
_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
sys.stdout = _stdout_capture
sys.stderr = _stderr_capture
`);

    let success = true;
    let stderr = "";
    try {
      await pyodide.runPythonAsync(code);
    } catch (error) {
      success = false;
      stderr = error instanceof Error ? error.message : String(error);
    }

    const stdout = String(await pyodide.runPythonAsync(`
_output = _stdout_capture.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
_output
`));
    send("result", { id, stdout: stdout.trim(), stderr: stderr.trim(), success });
  } catch (error) {
    send("result", {
      id,
      stdout: "",
      stderr: error instanceof Error ? error.message : String(error),
      success: false,
    });
  }
}

self.onmessage = (event) => {
  const message = event.data;
  if (message?.type === "init") {
    getPyodide()
      .then(() => send("ready"))
      .catch((error) => send("init-error", { error: String(error) }));
  } else if (message?.type === "execute") {
    void execute(message.id, String(message.code ?? ""));
  }
};
