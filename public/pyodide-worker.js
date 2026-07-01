/* global importScripts, loadPyodide */

const PYODIDE_URL = "https://cdn.jsdelivr.net/pyodide/v0.27.0/full/";

// ── mechdog mock 모듈 ───────────────────────────────────────────────────────────
const MOCK_HW_MECHDOG = `
import robot as _r

class MechDog:
    def set_default_pose(self, duration=1000):
        _r.mechdog_action("default_pose")
    def move(self, speed=0, angle=0):
        _r.mechdog_move(int(speed), int(angle))
    def transform(self, pos=None, rot=None, duration=1000):
        p = pos or [0, 0, 0]
        r = rot or [0, 0, 0]
        _r.mechdog_transform(p[0], p[1], p[2], r[0], r[1], r[2], int(duration))
    def set_pose(self, pos=None, rot=None, duration=1000):
        self.transform(pos, rot, duration)
    def set_gait_params(self, lift_time=150, land_time=350, height=30):
        _r.mechdog_gait(int(lift_time), int(land_time), int(height))
    def action_run(self, name=""):
        _r.mechdog_action(str(name))
    def homeostasis(self, enabled=False):
        _r.mechdog_homeostasis(bool(enabled))
    def read_homeostasis_status(self):
        return True
`;

const MOCK_HIWONDER = `
import robot as _r

class LED:
    def on(self): _r.mechdog_led(255, 200, 0)
    def off(self): _r.mechdog_led(0, 0, 0)
    def set_color(self, r=0, g=0, b=0): _r.mechdog_led(int(r), int(g), int(b))

class Buzzer:
    def freq(self, f=0, d=0): _r.mechdog_buzz(int(f), int(d))
    def on(self, f=440): _r.mechdog_buzz(int(f), 100)
    def off(self): pass

class Button:
    def Clicked(self): return False
    def isPressed(self): return False

class LightSensor:
    def read(self): return _r.mechdog_sensor_get("light")

class Digitaltube:
    def showNum(self, n=0): _r.mechdog_display(str(int(n)))
    def showStr(self, s=""): _r.mechdog_display(str(s))
    def setBrightness(self, b=4): pass
    def clear(self): _r.mechdog_display("")

class UART:
    def __init__(self, baud=9600): pass
    def contains_data(self, s=""): return False
    def read_uart_cmd(self): return ""
    def send_data(self, d=""): pass
    def parse_uart_cmd(self, d=""): return []

def Battery_power(): return 8.0

def startMain(func):
    try:
        func()
    except Exception:
        pass
`;

const MOCK_HIWONDER_IIC = `
import robot as _r

class IIC:
    def __init__(self, port=1): self.port = port

class I2CSonar:
    def __init__(self, i2c=None): pass
    def getDistance(self): return _r.mechdog_sensor_get("distance")
    def setRGB(self, index=0, r=0, g=0, b=0): _r.mechdog_led(int(r), int(g), int(b))

class asr_module:
    def __init__(self, i2c=None): pass
    def getResult(self): return 0
    def speak(self, index=0, value=0): pass

class ESP32S3Cam:
    RED = 1
    GREEN = 3
    BLUE = 4
    YELLOW = 2
    def __init__(self, i2c=None): pass
    def color_recognition(self): return []
    def color_follow(self, color=None): return None
    def face_recognition(self): return False
    def line_follow(self, color=None): return (0, 0)

class MPU:
    def __init__(self, i2c=None): pass
    def read_angle(self): return [0.0, 0.0, 0.0]
`;

const MOCK_HIWONDER_BLE = `
class BLE:
    def __init__(self, port=3, name=""):
        self.connected_callback = None
        self.disconnected_callback = None
    def is_connected(self): return False
    def contains_data(self, s=""): return False
    def read_uart_cmd(self): return ""
    def parse_uart_cmd(self, d=""): return []
    def send_data(self, d=""): pass
`;

const MOCK_HIWONDER_WIFI = `
class _WLan:
    def isconnected(self): return False

class WIFI_CL:
    def __init__(self, ssid="", pwd=""):
        self.wlan = _WLan()
        self.listenSocket = None
    def connect_wifi(self): pass
    def disconnect_wifi(self): pass
    def wait_connect(self): pass
    def read_data(self): return None
    def read_uart_cmd(self, data=""): return ""
    def parse_uart_cmd(self, d=""): return []
    def send_data(self, d=""): pass
    def send_ID(self): pass
`;

const MOCK_MACHINE = `
def unique_id():
    return b'\\x00\\x00\\x00\\x00\\x00\\x38'
`;
let pyodidePromise;
let currentPhase = "Worker 시작";

// ── lv3 데이터 분석 환경 ────────────────────────────────────────────────────────
let lv3Ready = false;
let lv3InitPromise = null;

async function initLv3Inner(pyodide) {
  currentPhase = "데이터 분석 패키지 로드";
  await pyodide.loadPackage(["numpy", "pandas", "matplotlib", "scikit-learn", "micropip"]);
  await pyodide.runPythonAsync("import micropip; await micropip.install('seaborn')");

  currentPhase = "한글 폰트 로드";
  try {
    const fontRes = await fetch(
      "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/nanumgothic/NanumGothic-Regular.ttf"
    );
    if (fontRes.ok) {
      const fontBuf = await fontRes.arrayBuffer();
      try { pyodide.FS.mkdir("/fonts"); } catch {}
      pyodide.FS.writeFile("/fonts/NanumGothic.ttf", new Uint8Array(fontBuf));
    }
  } catch {}

  currentPhase = "시각화 환경 설정";
  await pyodide.runPythonAsync(`
import io as _io, base64 as _b64
import matplotlib as _mpl
_mpl.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.font_manager as _fm

# 한글 폰트 등록
try:
    _fm.fontManager.addfont('/fonts/NanumGothic.ttf')
    _kor_font = _fm.FontProperties(fname='/fonts/NanumGothic.ttf').get_name()
    _mpl.rcParams['font.family'] = _kor_font
except Exception:
    pass
_mpl.rcParams['axes.unicode_minus'] = False  # 마이너스 기호 깨짐 방지

_plots = []

def _capture_show(*args, **kwargs):
    buf = _io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100, facecolor='white')
    buf.seek(0)
    _plots.append(_b64.b64encode(buf.read()).decode('utf-8'))
    plt.close('all')

plt.show = _capture_show

def load_data(filename):
    import pandas as _pd
    return _pd.read_csv(f'/data/{filename}.csv')
`);

  lv3Ready = true;
  currentPhase = "실행 대기";
}

function getInitLv3(pyodide) {
  if (lv3Ready) return Promise.resolve();
  if (!lv3InitPromise) {
    lv3InitPromise = initLv3Inner(pyodide).catch((e) => {
      lv3InitPromise = null;
      throw e;
    });
  }
  return lv3InitPromise;
}

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
  bounce: (times = 1) => send("robot-command", { command: "bounce", args: [times] }),
  spin: () => send("robot-command", { command: "spin", args: [] }),
  shake: () => send("robot-command", { command: "shake", args: [] }),
  clear: () => send("robot-command", { command: "clear", args: [] }),
  // ── mechdog 시뮬레이션 ──
  mechdog_move: (speed, angle) => send("robot-command", { command: "mechdog_move", args: [speed, angle] }),
  mechdog_action: (name) => send("robot-command", { command: "mechdog_action", args: [String(name)] }),
  mechdog_transform: (tx, ty, tz, pitch, roll, yaw, duration) => send("robot-command", { command: "mechdog_transform", args: [tx, ty, tz, pitch, roll, yaw, duration] }),
  mechdog_wait: (seconds) => send("robot-command", { command: "mechdog_wait", args: [seconds] }),
  mechdog_homeostasis: (enabled) => send("robot-command", { command: "mechdog_homeostasis", args: [enabled] }),
  mechdog_gait: (liftTime, landTime, height) => send("robot-command", { command: "mechdog_gait", args: [liftTime, landTime, height] }),
  mechdog_led: (r, g, b) => send("robot-command", { command: "mechdog_led", args: [r, g, b] }),
  mechdog_buzz: (freq, duration) => send("robot-command", { command: "mechdog_buzz", args: [freq, duration] }),
  mechdog_display: (text) => send("robot-command", { command: "mechdog_display", args: [String(text)] }),
  // 동기 반환: 센서 값을 Python 으로 즉시 돌려줌 (postMessage 아님)
  mechdog_sensor_get: (sensorType) => {
    const t = String(sensorType);
    if (t === "distance") return 50;
    if (t === "light") return 500;
    return 0;
  },
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
      currentPhase = "mechdog mock 모듈 설치";
      pyodide.FS.writeFile("/home/pyodide/HW_MechDog.py", MOCK_HW_MECHDOG);
      pyodide.FS.writeFile("/home/pyodide/Hiwonder.py", MOCK_HIWONDER);
      pyodide.FS.writeFile("/home/pyodide/Hiwonder_IIC.py", MOCK_HIWONDER_IIC);
      pyodide.FS.writeFile("/home/pyodide/Hiwonder_BLE.py", MOCK_HIWONDER_BLE);
      pyodide.FS.writeFile("/home/pyodide/Hiwonder_WIFI.py", MOCK_HIWONDER_WIFI);
      pyodide.FS.writeFile("/home/pyodide/machine.py", MOCK_MACHINE);
      currentPhase = "실행 대기";
      return pyodide;
    })();
  }
  return pyodidePromise;
}

async function execute(id, code, mode) {
  try {
    currentPhase = "Python 실행 환경 준비";
    const pyodide = await getPyodide();

    if (mode === "lv3") {
      await getInitLv3(pyodide);
      await pyodide.runPythonAsync("_plots.clear()");
    }

    pyodide.globals.set('_user_code', code);

    currentPhase = "사용자 Python 코드 실행";
    await pyodide.runPythonAsync(`
import sys, io, time, traceback as _tb
import robot as _robot_mod
time.sleep = lambda n: _robot_mod.mechdog_wait(n)
time.sleep_ms = lambda n: _robot_mod.mechdog_wait(n / 1000.0)
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
    let plots = [];
    if (mode === "lv3") {
      const plotsProxy = pyodide.globals.get("_plots");
      if (plotsProxy) plots = Array.from(plotsProxy.toJs());
    }

    currentPhase = "실행 대기";
    send("result", { id, stdout: stdout.trim(), stderr, success, plots });
  } catch (error) {
    send("result", {
      id,
      stdout: "",
      stderr: `[${currentPhase}]\n${error instanceof Error ? (error.message || String(error)) : String(error)}`,
      success: false,
      plots: [],
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
    void execute(message.id, String(message.code ?? ""), message.mode);
  } else if (message?.type === "init-lv3") {
    getPyodide()
      .then((pyodide) => getInitLv3(pyodide))
      .then(() => send("lv3-ready"))
      .catch((error) => send("lv3-error", errorDetails(error)));
  } else if (message?.type === "preload-csvs") {
    (async () => {
      try {
        const pyodide = await getPyodide();
        try { pyodide.FS.mkdir("/data"); } catch {}
        // files: Array<{filename: string, content: string}> — 내용은 메인 스레드에서 미리 fetch
        for (const file of (message.files || [])) {
          pyodide.FS.writeFile(`/data/${file.filename}`, file.content);
        }
        send("csvs-ready");
      } catch (error) {
        send("csvs-error", errorDetails(error));
      }
    })();
  }
};
