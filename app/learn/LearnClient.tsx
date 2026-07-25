"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { usePyodide } from "@/hooks/usePyodide";
import { parsePython } from "@/lib/python-parser";
import { effectiveConceptAccessIdsForOrders, isConceptUnlockedInOrders } from "@/lib/progress";
import { animationQueue, type RobotCommand } from "@/lib/animation-queue";
import RobotStage from "@/components/robot/RobotStage";
import RobotApiTooltip from "@/components/robot/RobotApiTooltip";
import MechdogApiTooltip from "@/components/robot/MechdogApiTooltip";
import DataVizPanel from "@/components/editor/DataVizPanel";
import OutputPanel from "@/components/editor/OutputPanel";
import BadgeCelebration from "@/components/badges/BadgeCelebration";
import Header from "@/components/layout/Header";
import StudentHintChatbot from "@/components/chat/StudentHintChatbot";
import type { CurriculumItem } from "@/lib/curriculum";
import { curriculumLevelOrders, groupCurriculumUnits, type CurriculumView } from "@/lib/curriculum-model";
import { Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert, PawPrint, Sword, BarChart2, TrendingUp, Filter, Cpu, Lock, Check } from "lucide-react";
import Image from "next/image";

const GROUP_ICON_MAP: Record<string, React.ElementType> = {
  Bot, Layers, Calculator, GitBranch, Braces, ShieldAlert, BarChart2, TrendingUp, Filter, Cpu,
};

type AppMode = "lv1" | "lv2" | "lv3" | "mechdog";

interface MechdogExample {
  id: string;
  category: string;
  label: string;
  description: string;
  code: string;
}

const MECDOG_EXAMPLES: MechdogExample[] = [
  {
    id: "intro",
    category: "📖 소개",
    label: "mechdog 소개",
    description: "mechdog는 Hiwonder의 AI 교육용 4족 보행 로봇이에요! 이동, 자세 변환, gait 설정, 기본 동작, 균형 유지, LED, 부저, 숫자 표시, 초음파/빛/버튼/IMU/카메라 센서 API를 시뮬레이션에서 한 번씩 실습할 수 있어요.",
    code: `from HW_MechDog import MechDog
import Hiwonder
import Hiwonder_IIC
import time

# 0. mechdog와 부품 준비
mechdog = MechDog()
led = Hiwonder.LED()
buzzer = Hiwonder.Buzzer()
button = Hiwonder.Button()
light = Hiwonder.LightSensor()
tm = Hiwonder.Digitaltube()
i2c1 = Hiwonder_IIC.IIC(1)
i2c2 = Hiwonder_IIC.IIC(2)
sonar = Hiwonder_IIC.I2CSonar(i2c1)
imu = Hiwonder_IIC.MPU(i2c1)
cam = Hiwonder_IIC.ESP32S3Cam(i2c2)

# 1. 기본 자세
mechdog.set_default_pose()
time.sleep(1)

# 2. 이동: 전진, 후진, 회전
mechdog.move(80, 0)
time.sleep(1.2)
mechdog.move(-50, 0)
time.sleep(1)
mechdog.move(60, 25)
time.sleep(1)
mechdog.move(60, -25)
time.sleep(1)
mechdog.move(0, 0)
time.sleep(0.5)

# 3. 걸음걸이 설정
mechdog.set_gait_params(200, 600, 50)  # 느리고 높게 걷기
mechdog.move(60, 0)
time.sleep(1.2)
mechdog.set_gait_params(100, 280, 20)  # 빠르고 낮게 걷기
mechdog.move(100, 0)
time.sleep(1.2)
mechdog.move(0, 0)

# 4. 자세 변환: 높이, 앞뒤/좌우 기울기
mechdog.transform([0, 0, 20], [0, 0, 0], 1000)
time.sleep(0.8)
mechdog.transform([0, 0, -15], [0, 0, 0], 1000)
time.sleep(0.8)
mechdog.transform([0, 0, 0], [12, 0, 0], 500)
time.sleep(0.7)
mechdog.transform([0, 0, 0], [0, 10, 0], 500)
time.sleep(0.7)
mechdog.set_default_pose()
time.sleep(0.7)

# 5. 미리 정의된 동작
actions = [
    "nodding_motion", "handshake", "scrape_a_bow",
    "boxing", "stretch_oneself", "sit_dowm",
    "stand_four_legs", "stand_two_legs", "go_prone",
    "press_up", "left_foot_kick", "right_foot_kick",
    "rotation_pitch", "rotation_roll", "pee",
]

for name in actions:
    mechdog.action_run(name)
    time.sleep(1.1)

# 6. 균형 유지
mechdog.homeostasis(True)
time.sleep(1)
mechdog.homeostasis(False)
mechdog.set_default_pose()
time.sleep(1)

# 7. 출력 장치: LED, 부저, 숫자 표시
led.on()
time.sleep(0.4)
led.set_color(0, 180, 255)
time.sleep(0.4)
led.off()

buzzer.freq(440, 300)
time.sleep(0.4)
buzzer.freq(523, 300)
time.sleep(0.4)

tm.setBrightness(4)
tm.showNum(9)
time.sleep(0.6)
tm.showStr("GO")
time.sleep(0.6)
tm.clear()

# 8. 센서 읽기 (시뮬레이션에서는 고정값을 반환해요)
distance = sonar.getDistance()
brightness = light.read()
pressed = button.Clicked()
angles = imu.read_angle()
colors = cam.color_recognition()
green = cam.color_follow(cam.GREEN)
face = cam.face_recognition()
line = cam.line_follow(cam.YELLOW)

print("거리:", distance, "cm")
print("밝기:", brightness)
print("버튼:", pressed)
print("기울기:", angles)
print("색상:", colors, "초록 추적:", green)
print("얼굴:", face, "선:", line)

# 9. 센서값으로 LED와 디스플레이 제어
tm.showNum(distance)
if distance < 15:
    sonar.setRGB(0, 255, 0, 0)
    mechdog.move(0, 0)
elif distance > 40:
    sonar.setRGB(0, 0, 80, 255)
    mechdog.move(60, 0)
else:
    sonar.setRGB(0, 255, 210, 0)
    mechdog.action_run("handshake")

time.sleep(1)
mechdog.move(0, 0)
mechdog.set_default_pose()
`,
  },
  {
    id: "forward_backward",
    category: "4.2 이동 제어",
    label: "전진 / 후진",
    description: "move(속도, 각도)로 mechdog를 걷게 해요. 속도는 -120~120 (양수=전진, 음수=후진), 각도는 -50~50 (회전 방향)이에요. time.sleep(초)으로 얼마나 이동할지 시간을 조절합니다.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.move(80, 0)   # 앞으로 (양수 → 전진)
time.sleep(3)

mechdog.move(0, 0)    # 멈추기
time.sleep(1)

mechdog.move(-50, 0)  # 뒤로 (음수 → 후진)
time.sleep(3)

mechdog.move(0, 0)
`,
  },
  {
    id: "wheel",
    category: "4.2 이동 제어",
    label: "회전 이동",
    description: "move()의 두 번째 값(각도)으로 회전을 조절해요. 양수 각도는 왼쪽, 음수 각도는 오른쪽으로 회전하며 이동합니다. 호(곡선) 모양 경로로 이동시킬 수 있어요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.move(50, -20)  # 오른쪽으로 회전하며 이동
time.sleep(3)
mechdog.move(0, 0)
time.sleep(1)

mechdog.move(50, 20)   # 왼쪽으로 회전하며 이동
time.sleep(3)
mechdog.move(0, 0)
`,
  },
  {
    id: "body_height",
    category: "4.2 이동 제어",
    label: "높이 / 기울기",
    description: "transform([tx,ty,tz], [pitch,roll,yaw], ms)으로 몸통 높이와 기울기를 조절해요. tz는 높이(mm, 양수=올리기), pitch는 앞뒤 기울기(도), roll은 좌우 기울기(도)입니다.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.transform([0, 0, 20], [0, 0, 0], 1000)   # 몸 올리기
time.sleep(2)
mechdog.transform([0, 0, -20], [0, 0, 0], 1000)  # 몸 낮추기
time.sleep(2)
mechdog.transform([0, 0, 0], [15, 0, 0], 500)    # 앞으로 기울기
time.sleep(1.5)
mechdog.transform([0, 0, 0], [-15, 0, 0], 500)   # 뒤로 기울기
time.sleep(1.5)
mechdog.set_default_pose()
`,
  },
  {
    id: "action_run",
    category: "4.3 동작 실행",
    label: "동작 실행",
    description: "action_run(\"동작이름\")으로 미리 정의된 동작을 실행해요. mechdog는 악수, 인사, 권투, 기지개 등 총 15가지 동작을 지원합니다. time.sleep(초)으로 동작 완료를 충분히 기다려야 자연스러워요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.action_run("handshake")       # 악수
time.sleep(3)

mechdog.action_run("nodding_motion")  # 고개 끄덕이기
time.sleep(3)

mechdog.action_run("boxing")          # 권투
time.sleep(3)
`,
  },
  {
    id: "sit_stand",
    category: "4.3 동작 실행",
    label: "앉기 / 서기",
    description: "앉기(sit_dowm), 네 발로 서기(stand_four_legs), 두 발로 서기(stand_two_legs) 동작을 순서대로 실행해요. 각 동작마다 충분한 time.sleep을 주어야 동작이 완료된 후 다음 동작으로 이어져요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.action_run("sit_dowm")         # 앉기
time.sleep(3)

mechdog.action_run("stand_four_legs")  # 네 발로 서기
time.sleep(2)

mechdog.action_run("stand_two_legs")   # 두 발로 서기
time.sleep(3)
`,
  },
  {
    id: "homeostasis",
    category: "4.3 동작 실행",
    label: "균형 유지",
    description: "homeostasis(True)를 켜면 mechdog가 외부 충격을 받아도 자동으로 균형을 잡아요. 실제 로봇을 손으로 밀어도 스스로 자세를 교정합니다. False로 끄면 일반 자세로 돌아와요.",
    code: `from HW_MechDog import MechDog
import time

mechdog = MechDog()
mechdog.set_default_pose()
time.sleep(1)

mechdog.homeostasis(True)   # 균형 유지 ON
time.sleep(3)

mechdog.homeostasis(False)  # 균형 유지 OFF
time.sleep(1)
`,
  },
  {
    id: "ultrasonic",
    category: "4.3 센서 활용",
    label: "초음파 거리 센서",
    description: "I2CSonar 센서로 앞 물체까지의 거리(cm)를 측정하고, 거리에 따라 LED 색상을 바꿔요. Digitaltube에 거리 수치도 표시됩니다. 시뮬레이션에서는 거리가 항상 50cm로 반환돼요.",
    code: `import Hiwonder
import Hiwonder_IIC
from HW_MechDog import MechDog
import time

mechdog = MechDog()
tm = Hiwonder.Digitaltube()
i2c1 = Hiwonder_IIC.IIC(1)
i2csonar = Hiwonder_IIC.I2CSonar(i2c1)

mechdog.set_default_pose()
time.sleep(1)

for i in range(5):
    distance = i2csonar.getDistance()
    tm.showNum(distance)           # 숫자판에 거리 표시

    if distance < 15:
        i2csonar.setRGB(0, 0xff, 0x00, 0x00)  # 빨강: 가까움
    elif distance > 40:
        i2csonar.setRGB(0, 0x00, 0x00, 0x99)  # 파랑: 멈
    else:
        i2csonar.setRGB(0, 0xfd, 0xd0, 0x00)  # 노랑: 중간

    time.sleep(0.5)
`,
  },
  {
    id: "color_tracking",
    category: "4.5 AI 비전",
    label: "색상 추적",
    description: "ESP32S3 카메라로 특정 색상을 추적해요. 물체의 X 위치에 따라 mechdog가 방향을 조정하며 이동합니다. 시뮬레이션에서는 카메라가 색상을 감지하지 않아 항상 정지 상태로 표시돼요.",
    code: `import Hiwonder_IIC
from HW_MechDog import MechDog
import time

iic2 = Hiwonder_IIC.IIC(2)
cam = Hiwonder_IIC.ESP32S3Cam(iic2)
mechdog = MechDog()

mechdog.set_default_pose()
time.sleep(2)

# 시뮬레이션: 카메라는 색상 미감지 → 정지 상태 표시
for _ in range(5):
    color = cam.color_follow(cam.GREEN)

    if color and color[0] == 3:    # 초록색 감지
        if color[1] < 60:
            mechdog.move(50, 25)   # 왼쪽으로 이동
        elif color[1] > 100:
            mechdog.move(50, -25)  # 오른쪽으로 이동
        else:
            mechdog.move(50, 0)    # 직진
    else:
        mechdog.move(0, 0)         # 색상 미감지: 정지

    time.sleep(0.3)

mechdog.move(0, 0)
`,
  },
];

const CodeEditor = dynamic(() => import("@/components/editor/CodeEditor"), { ssr: false });

const INITIAL_CODE = `# 파이썬 코드를 여기에 입력하세요
import robot

robot.say("안녕! 나는 AI 로봇이야!")
robot.move(2)
robot.draw("star")
robot.dance()
`;

interface LearnClientProps {
  userName: string;
  curriculum: Record<number, CurriculumItem>;
  curriculumView: CurriculumView;
  isStudent: boolean;
}

export default function LearnClient({ userName, curriculum, curriculumView, isStudent }: LearnClientProps) {
  const [code, setCode] = useState(INITIAL_CODE);
  const [output, setOutput] = useState("");
  const [execError, setExecError] = useState("");
  const [hasRun, setHasRun] = useState(false);
  const [running, setRunning] = useState(false);
  const [speechText, setSpeechText] = useState("");
  const [showSpeech, setShowSpeech] = useState(false);
  const [newBadgeIds, setNewBadgeIds] = useState<number[]>([]);
  const [badgeFeedback, setBadgeFeedback] = useState("");
  const [selectedConceptId, setSelectedConceptId] = useState(0);
  // 지금 에디터에 로드된 연습문제의 개념 ID. 문제 풀이 중일 때만 서버 채점을 요청한다.
  const [practiceConceptId, setPracticeConceptId] = useState<number | null>(null);
  // 클리어(뱃지 획득)한 개념 목록. 순차 잠금 해제의 기준.
  const [clearedConceptIds, setClearedConceptIds] = useState<Set<number>>(new Set());
  const [manuallyUnlockedConceptIds, setManuallyUnlockedConceptIds] = useState<Set<number>>(new Set());
  const [conceptExpanded, setConceptExpanded] = useState(true);
  const [showOutput, setShowOutput] = useState(false);
  const [fontSize, setFontSize] = useState(9);
  const fontSizeStr = `${fontSize}pt`;

  const [mode, setMode] = useState<AppMode>("lv1");
  const [selectedMechdogId, setSelectedMechdogId] = useState(MECDOG_EXAMPLES[0].id);
  const [selectedLv3ConceptId, setSelectedLv3ConceptId] = useState(31);

  const levelOrders = useMemo(
    () => curriculumLevelOrders(curriculumView.units),
    [curriculumView.units]
  );
  const currentLevel = mode === "lv3" ? 3 : mode === "lv2" ? 2 : 1;
  const currentBadges = curriculumView.units
    .filter((unit) => unit.level === currentLevel)
    .map((unit) => ({
      conceptId: unit.id,
      nameKo: unit.badgeNameKo,
      iconName: unit.iconName,
      colorClass: unit.colorClass,
    }));
  const currentUnitGroups = groupCurriculumUnits(curriculumView.units, currentLevel);

  const [characterType, setCharacterType] = useState<"robot" | "dog" | "game" | "mechdog">("robot");
  const [isError, setIsError] = useState(false);

  const [commands, setCommands] = useState<RobotCommand[]>([]);
  const [pendingFeedback, setPendingFeedback] = useState<{
    feedback: string;
    badgeIds: number[];
  } | null>(null);

  const [varName, setVarName] = useState<string>("");
  const [varValue, setVarValue] = useState<string>("");
  const [showVariable, setShowVariable] = useState(false);

  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const runningRef = useRef(false);
  // 로봇 애니메이션이 아직 재생 중인지. AI 채점 응답이 애니메이션보다 늦게 오는 경우가 많아,
  // 응답 시점에 애니메이션이 이미 끝났으면 피드백/뱃지를 바로 표시해야 한다.
  const animationDoneRef = useRef(true);

  const [plots, setPlots] = useState<string[]>([]);

  const { loading: pyLoading, error: pyError, lv3Loading, initLv3, preloadCsvs, executeCode, restart: restartPyodide } = usePyodide();

  const showSpeechBubble = useCallback((text: string, duration = 8000) => {
    setSpeechText(text);
    setShowSpeech(true);
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current = setTimeout(() => setShowSpeech(false), duration);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      showSpeechBubble(
        `안녕, ${userName}! 나는 AI 코딩 친구야. 왼쪽에서 단원을 선택하고 예제를 불러오거나 코드를 직접 수정해봐! robot.move(2) 처럼 코드를 쓰면 내가 스테이지에서 직접 움직여!`,
        11000
      );
    }, 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isStudent) return;

    fetch("/api/progress")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.clearedConceptIds)) setClearedConceptIds(new Set<number>(data.clearedConceptIds));
        if (Array.isArray(data?.manuallyUnlockedConceptIds)) {
          setManuallyUnlockedConceptIds(new Set<number>(data.manuallyUnlockedConceptIds));
        }
      })
      .catch(() => { /* 조회 실패 시 첫 개념만 열린 기본 상태로 시작 */ });
  }, [isStudent]);

  const accessibleConceptIds = effectiveConceptAccessIdsForOrders(
    clearedConceptIds,
    manuallyUnlockedConceptIds,
    levelOrders
  );

  useEffect(() => {
    setPracticeConceptId(null);
    if (mode === "mechdog") {
      setCharacterType("mechdog");
      const first = MECDOG_EXAMPLES[0];
      setSelectedMechdogId(first.id);
      setCode(first.code);
      return;
    }
    // mechdog 전용 캐릭터는 다른 모드에서 선택 불가하므로 로봇으로 복귀
    setCharacterType((prev) => (prev === "mechdog" ? "robot" : prev));
    if (mode === "lv3") {
      const firstId = curriculumView.units
        .filter((unit) => unit.level === 3)
        .sort((a, b) => a.orderIndex - b.orderIndex)[0]?.id;
      if (firstId !== undefined) {
        setSelectedLv3ConceptId(firstId);
        setCode(curriculum[firstId]?.exampleCode ?? "");
      }
      setPlots([]);
      (async () => {
        await initLv3();
        const res = await fetch("/api/data/list");
        const { files } = await res.json() as { files: Array<{url: string; filename: string}> };
        if (files.length > 0) {
          const contents = await Promise.all(
            files.map(async (f) => {
              const csvRes = await fetch(f.url);
              const content = await csvRes.text();
              return { filename: f.filename, content };
            })
          );
          await preloadCsvs(contents);
        }
      })();
      return;
    }
    const level = mode === "lv2" ? 2 : 1;
    const firstId = curriculumView.units
      .filter((unit) => unit.level === level)
      .sort((a, b) => a.orderIndex - b.orderIndex)[0]?.id;
    if (firstId === undefined) {
      setCode("");
      return;
    }
    setSelectedConceptId(firstId);
    const example = curriculum[firstId];
    if (example?.exampleCode) setCode(example.exampleCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleRun = useCallback(async () => {
    if (runningRef.current || pyLoading) return;
    runningRef.current = true;
    setRunning(true);
    setHasRun(true);
    setShowSpeech(false);
    setCommands([]);
    setPendingFeedback(null);
    setShowVariable(false);
    setIsError(false);

    let stdout = "", stderr = "", success = false, newPlots: string[] = [];
    try {
      ({ stdout, stderr, success, plots: newPlots = [] } = await executeCode(code, mode === "lv3" ? "lv3" : undefined));
    } finally {
      runningRef.current = false;
    }
    if (mode === "lv3") setPlots(newPlots);
    setOutput(stdout);
    setExecError(stderr);
    setIsError(!success);
    if (stdout || stderr) setShowOutput(true);

    const parseResult = parsePython(code);
    const primary = parseResult.primaryConcept;

    if (mode !== "mechdog" && success && primary && primary.conceptKey === "variable") {
      setVarName((primary.details.lastVarName as string) || "");
      setVarValue((primary.details.lastVarValue as string) || "");
      setShowVariable(true);
    }

    const queueCommands = animationQueue.get();
    animationDoneRef.current = queueCommands.length === 0;
    setCommands(queueCommands);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code, stdout, stderr, isSuccess: success,
          practiceConceptId: mode === "mechdog" ? null : practiceConceptId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        let feedback: string = data.feedback;
        const badgeIds: number[] = data.newlyEarnedBadgeIds;
        if (badgeIds.length > 0) {
          setClearedConceptIds((prev) => new Set([...prev, ...badgeIds]));
        }

        if (!success) {
          const friendlyExplanation = getFriendlyErrorExplanation(stderr);
          if (feedback.includes("코드에 오류가 있어요") || feedback.trim().length === 0) {
            feedback = friendlyExplanation;
          } else {
            feedback = `${friendlyExplanation}\n\n💡 힌트: ${feedback}`;
          }
        }

        if (success && !animationDoneRef.current) {
          setPendingFeedback({ feedback, badgeIds });
        } else {
          setPendingFeedback(null);
          showSpeechBubble(feedback);
          if (success && badgeIds.length > 0) {
            setBadgeFeedback(feedback);
            setNewBadgeIds(badgeIds);
            setCommands([{ type: "dance", params: {} }]);
          }
        }
      } else {
        const fallback = success ? "잘 했어요! 코드가 잘 동작합니다." : getFriendlyErrorExplanation(stderr);
        if (success && !animationDoneRef.current) {
          setPendingFeedback({ feedback: fallback, badgeIds: [] });
        } else {
          setPendingFeedback(null);
          showSpeechBubble(fallback);
        }
      }
    } catch {
      const fallback = success ? "잘 했어요! 코드가 잘 동작합니다." : getFriendlyErrorExplanation(stderr);
      if (success && !animationDoneRef.current) {
        setPendingFeedback({ feedback: fallback, badgeIds: [] });
      } else {
        setPendingFeedback(null);
        showSpeechBubble(fallback);
      }
    }

    setRunning(false);
  }, [pyLoading, code, mode, practiceConceptId, executeCode, showSpeechBubble]);

  const handleAnimationComplete = useCallback(() => {
    animationDoneRef.current = true;
    if (pendingFeedback) {
      showSpeechBubble(pendingFeedback.feedback);
      if (pendingFeedback.badgeIds.length > 0) {
        setBadgeFeedback(pendingFeedback.feedback);
        setNewBadgeIds(pendingFeedback.badgeIds);
        setCommands([{ type: "dance", params: {} }]);
      }
      setPendingFeedback(null);
    }
  }, [pendingFeedback, showSpeechBubble]);

  // 축하 팝업의 "다음 단계 공부하기": 다음 개념을 선택하고 예제 코드를 로드
  const handleGoNextConcept = useCallback((id: number) => {
    setNewBadgeIds([]);
    setPracticeConceptId(null);
    setShowSpeech(false);
    setOutput("");
    setExecError("");
    setHasRun(false);
    setShowOutput(false);
    setPendingFeedback(null);
    setCommands([]);
    setShowVariable(false);
    setIsError(false);
    setPlots([]);
    const targetUnit = curriculumView.units.find((unit) => unit.id === id);
    if (targetUnit?.level === 3) {
      setSelectedLv3ConceptId(id);
    } else {
      setSelectedConceptId(id);
    }
    const example = curriculum[id];
    if (example?.exampleCode) setCode(example.exampleCode);
  }, [curriculum, curriculumView.units]);

  const handleLoadExample = useCallback(() => {
    setPracticeConceptId(null);
    if (mode === "mechdog") {
      const ex = MECDOG_EXAMPLES.find(e => e.id === selectedMechdogId);
      if (ex) setCode(ex.code);
      return;
    }
    if (mode === "lv3") {
      const ex = curriculum[selectedLv3ConceptId];
      if (ex) setCode(ex.exampleCode);
      return;
    }
    const example = curriculum[selectedConceptId];
    if (example) setCode(example.exampleCode);
  }, [mode, selectedMechdogId, selectedConceptId, selectedLv3ConceptId, curriculum]);

  const handleLoadPractice = useCallback(() => {
    if (mode === "mechdog") return;
    if (mode === "lv3") {
      const ex = curriculum[selectedLv3ConceptId];
      if (ex?.practiceCode) {
        setCode(ex.practiceCode);
        setPracticeConceptId(selectedLv3ConceptId);
      }
      return;
    }
    const example = curriculum[selectedConceptId];
    if (example?.practiceCode) {
      setCode(example.practiceCode);
      setPracticeConceptId(selectedConceptId);
    }
  }, [mode, selectedConceptId, selectedLv3ConceptId, curriculum]);

  const handleReset = useCallback(() => {
    setPracticeConceptId(null);
    setCode(INITIAL_CODE);
    setOutput("");
    setExecError("");
    setHasRun(false);
    setShowSpeech(false);
    setCommands([]);
    setPendingFeedback(null);
    setShowVariable(false);
    setIsError(false);
    setShowOutput(false);
  }, []);

  const currentConcept = curriculum[selectedConceptId];

  const selectedMechdogExample = MECDOG_EXAMPLES.find(e => e.id === selectedMechdogId);

  const displayConcept = mode === "mechdog"
    ? {
        nameKo: selectedMechdogExample?.label ?? "mechdog 시뮬레이션",
        nameEn: selectedMechdogExample?.category ?? "Robot Dog Simulator",
        explanation: selectedMechdogExample?.description ?? "실제 mechdog 파이썬 코드를 그대로 입력하고 실행해보세요!",
      }
    : mode === "lv3"
    ? curriculum[selectedLv3ConceptId]
    : currentConcept;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "linear-gradient(160deg,#F4EFFC 0%,#FCEFF6 52%,#EEF3FE 100%)",
      }}
    >
      <Header />

      {pyError && (
        <section className="runtime-error-panel" role="alert" aria-live="assertive">
          <div>
            <strong>Python 실행 환경 오류</strong>
            <pre>{pyError}</pre>
          </div>
          <button type="button" onClick={restartPyodide}>실행 환경 다시 시작</button>
        </section>
      )}

      {/* 3-column workspace */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: 14, padding: "10px 18px 18px" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div
          style={{
            width: 192,
            flex: "none",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: 20,
            border: "1px solid #EFEAF8",
            boxShadow: "0 8px 24px rgba(90,63,214,.06)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "13px 14px 10px",
              borderBottom: "1px solid #F2EDF9",
              fontSize: 11.5,
              fontWeight: 700,
              color: "#B0A8CC",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            단원 목록
          </div>
          {/* Mode dropdown */}
          <div style={{ padding: "8px 8px 4px" }}>
            <div style={{ position: "relative" }}>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as AppMode)}
                style={{
                  width: "100%",
                  padding: "6px 28px 6px 10px",
                  border: "1.5px solid #E0D8F8",
                  borderRadius: 10,
                  background: mode === "mechdog"
                    ? "linear-gradient(135deg,#FFF4E6,#FFE8CC)"
                    : mode === "lv3"
                    ? "linear-gradient(135deg,#E8F5E9,#D0F0DD)"
                    : "linear-gradient(135deg,#F8F5FF,#F0EAFF)",
                  color: mode === "mechdog" ? "#C97B30" : mode === "lv3" ? "#18C99A" : "#7B5CF0",
                  fontSize: 12.5,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                  WebkitAppearance: "none",
                  transition: "all .15s",
                }}
              >
                <option value="lv1">📚 Lv.1 기초</option>
                <option value="lv2">🚀 Lv.2 심화</option>
                <option value="lv3">📊 Lv.3 데이터 분석</option>
                <option value="mechdog">🐾 mechdog 시뮬</option>
              </select>
              <span
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: mode === "mechdog" ? "#C97B30" : "#9B7FFF",
                  fontSize: 10,
                }}
              >
                ▼
              </span>
            </div>
          </div>
          {mode === "lv3" ? (
            /* lv3 데이터 분석 단원 목록 */
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
              {currentUnitGroups.map((group) => (
                <div key={group.label} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: group.color, letterSpacing: 0.5, padding: "6px 8px 3px", textTransform: "uppercase" }}>
                    {(() => { const Icon = GROUP_ICON_MAP[group.icon]; return Icon ? <Icon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : null; })()}
                    {group.label}
                  </div>
                  {group.ids.map((id) => {
                    const badge = currentBadges.find(b => b.conceptId === id);
                    if (!badge) return null;
                    const selected = id === selectedLv3ConceptId;
                    const cleared = isStudent && clearedConceptIds.has(id);
                    const unit = curriculumView.units.find((item) => item.id === id);
                    const unlocked = !isStudent || unit?.sourceConceptId === 0 || isConceptUnlockedInOrders(id, accessibleConceptIds, levelOrders);
                    return (
                      <button
                        key={id}
                        disabled={!unlocked}
                        title={unlocked ? undefined : "이전 문제를 풀면 잠금 해제!"}
                        onClick={() => {
                          setSelectedLv3ConceptId(id);
                          setPracticeConceptId(null);
                          setCode(curriculum[id]?.exampleCode ?? "");
                        }}
                        style={{
                          width: "100%", textAlign: "left",
                          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
                          padding: "7px 10px", borderRadius: 10, border: "none",
                          cursor: unlocked ? "pointer" : "not-allowed", fontFamily: "inherit", fontSize: 13,
                          fontWeight: selected ? 700 : 500,
                          background: selected ? "linear-gradient(135deg,#34D9A6,#18C99A)" : "transparent",
                          color: selected ? "#fff" : unlocked ? "#7A6FA0" : "#C9C1DE",
                          marginBottom: 1, transition: "all .13s",
                          boxShadow: selected ? "0 3px 8px rgba(24,201,154,.22)" : "none",
                        }}
                        onMouseEnter={(e) => { if (!selected && unlocked) e.currentTarget.style.background = "#E8F5E9"; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{badge.nameKo}</span>
                        {cleared ? (
                          <Check size={13} color={selected ? "#fff" : "#18C99A"} strokeWidth={3} style={{ flexShrink: 0 }} />
                        ) : !unlocked ? (
                          <Lock size={12} color="#C9C1DE" style={{ flexShrink: 0 }} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : mode === "mechdog" ? (
            /* mechdog 예제 목록 */
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
              {(() => {
                const categories = [...new Set(MECDOG_EXAMPLES.map(e => e.category))];
                return categories.map(category => (
                  <div key={category} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: "#C97B30", letterSpacing: 0.5, padding: "6px 8px 3px", textTransform: "uppercase" }}>
                      🐾 {category}
                    </div>
                    {MECDOG_EXAMPLES.filter(ex => ex.category === category).map(ex => {
                      const selected = selectedMechdogId === ex.id;
                      return (
                        <button
                          key={ex.id}
                          onClick={() => { setSelectedMechdogId(ex.id); setCode(ex.code); }}
                          style={{
                            width: "100%",
                            textAlign: "left",
                            display: "block",
                            padding: "7px 10px",
                            borderRadius: 10,
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "inherit",
                            fontSize: 13,
                            fontWeight: selected ? 700 : 500,
                            background: selected ? "linear-gradient(135deg,#F0A050,#C97B30)" : "transparent",
                            color: selected ? "#fff" : "#7A6FA0",
                            marginBottom: 1,
                            transition: "all .13s",
                            boxShadow: selected ? "0 3px 8px rgba(201,123,48,.22)" : "none",
                          }}
                          onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = "#FFF4E6"; }}
                          onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                        >
                          {ex.label}
                        </button>
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
          ) : (
            /* 기존 커리큘럼 목록 */
            <div style={{ flex: 1, overflowY: "auto", padding: "8px 8px 12px" }}>
              {currentUnitGroups.map((group) => (
                <div key={group.label} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: group.color,
                      letterSpacing: 0.5,
                      padding: "6px 8px 3px",
                      textTransform: "uppercase",
                    }}
                  >
                    {(() => { const Icon = GROUP_ICON_MAP[group.icon]; return Icon ? <Icon size={11} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} /> : null; })()}
                    {group.label}
                  </div>
                  {group.ids.map((id) => {
                    const badge = currentBadges.find(b => b.conceptId === id);
                    if (!badge) return null;
                    const name = badge.nameKo.replace(" 마스터", "");
                    const selected = id === selectedConceptId;
                    const cleared = isStudent && clearedConceptIds.has(id);
                    const unit = curriculumView.units.find((item) => item.id === id);
                    const unlocked = !isStudent || unit?.sourceConceptId === 0 || isConceptUnlockedInOrders(id, accessibleConceptIds, levelOrders);
                    return (
                      <button
                        key={id}
                        disabled={!unlocked}
                        title={unlocked ? undefined : "이전 문제를 풀면 잠금 해제!"}
                        onClick={() => {
                          setSelectedConceptId(id);
                          setPracticeConceptId(null);
                          const example = curriculum[id];
                          if (example?.exampleCode) setCode(example.exampleCode);
                        }}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 6,
                          padding: "7px 10px",
                          borderRadius: 10,
                          border: "none",
                          cursor: unlocked ? "pointer" : "not-allowed",
                          fontFamily: "inherit",
                          fontSize: 13,
                          fontWeight: selected ? 700 : 500,
                          background: selected ? "linear-gradient(135deg,#9B7FFF,#7B5CF0)" : "transparent",
                          color: selected ? "#fff" : unlocked ? "#7A6FA0" : "#C9C1DE",
                          marginBottom: 1,
                          transition: "all .13s",
                          boxShadow: selected ? "0 3px 8px rgba(123,92,240,.22)" : "none",
                        }}
                        onMouseEnter={(e) => { if (!selected && unlocked) e.currentTarget.style.background = "#F3EFFE"; }}
                        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = "transparent"; }}
                      >
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                        {cleared ? (
                          <Check size={13} color={selected ? "#fff" : "#18C99A"} strokeWidth={3} style={{ flexShrink: 0 }} />
                        ) : !unlocked ? (
                          <Lock size={12} color="#C9C1DE" style={{ flexShrink: 0 }} />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CENTER: Editor column ── */}
        <div style={{ flex: 1.2, minWidth: 0, display: "flex", flexDirection: "column", gap: 10, position: "relative" }}>

          {/* Concept explanation panel (collapsible) */}
          <div
            style={{
              flex: "none",
              background: "#fff",
              borderRadius: 16,
              border: "1px solid #EFEAF8",
              boxShadow: "0 4px 14px rgba(90,63,214,.05)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setConceptExpanded(!conceptExpanded)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800, color: mode === "mechdog" ? "#C97B30" : mode === "lv3" ? "#18C99A" : "#7B5CF0" }}>
                {mode === "mechdog" ? "🐾" : mode === "lv3" ? "📊" : "📖"} {displayConcept?.nameKo}
              </span>
              <span
                style={{
                  fontSize: 11, fontWeight: 600,
                  color: mode === "mechdog" ? "#C97B30" : mode === "lv3" ? "#18C99A" : "#9B7FFF",
                  background: mode === "mechdog" ? "#FFF4E6" : mode === "lv3" ? "#E8F5E9" : "#F2ECFD",
                  padding: "2px 8px", borderRadius: 99,
                }}
              >
                {displayConcept?.nameEn}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  color: "#C4BDD8",
                  transform: conceptExpanded ? "rotate(0deg)" : "rotate(180deg)",
                  transition: "transform .2s",
                  display: "inline-block",
                }}
              >
                ▲
              </span>
            </button>
            {conceptExpanded && (
              <div
                style={{
                  padding: "0 16px 12px",
                  borderTop: "1px solid #F5F0FF",
                }}
              >
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13.5,
                    color: "#5C5480",
                    lineHeight: 1.65,
                  }}
                >
                  {displayConcept?.explanation}
                </p>
              </div>
            )}
          </div>

          {/* Code editor card */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              borderRadius: 22,
              border: "1px solid #EFEAF8",
              boxShadow: "0 12px 30px rgba(90,63,214,.07)",
              overflow: "hidden",
            }}
          >
            {/* Editor titlebar */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 16px",
                borderBottom: "1px solid #F2EDF9",
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5C8A", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FFC23C", display: "inline-block" }} />
              <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#18C99A", display: "inline-block" }} />
              <span
                style={{
                  fontFamily: "var(--font-jetbrains), 'JetBrains Mono', monospace",
                  fontSize: 13,
                  color: "#9A93B5",
                  marginLeft: 6,
                }}
              >
                main.py
              </span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                {/* Font size controls */}
                <div style={{ display: "flex", alignItems: "center", gap: 3, background: "#F4F0FE", borderRadius: 8, padding: "2px 4px" }}>
                  <button
                    onClick={() => setFontSize(s => Math.max(7, s - 1))}
                    title="글자 크기 줄이기"
                    style={{ width: 22, height: 22, border: "none", background: "transparent", cursor: "pointer", color: "#7B5CF0", fontWeight: 700, fontSize: 14, lineHeight: 1, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >−</button>
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#7B5CF0", minWidth: 28, textAlign: "center" }}>{fontSize}pt</span>
                  <button
                    onClick={() => setFontSize(s => Math.min(16, s + 1))}
                    title="글자 크기 키우기"
                    style={{ width: 22, height: 22, border: "none", background: "transparent", cursor: "pointer", color: "#7B5CF0", fontWeight: 700, fontSize: 14, lineHeight: 1, borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >+</button>
                </div>
                {mode === "mechdog" ? <MechdogApiTooltip /> : mode !== "lv3" && <RobotApiTooltip />}
              </div>
            </div>

            {/* Code editor */}
            <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
              <CodeEditor value={code} onChange={setCode} fontSize={fontSizeStr} />
            </div>

            {/* Action buttons */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "11px 16px",
                borderTop: "1px solid #F2EDF9",
              }}
            >
              {/* Run */}
              <button
                onClick={handleRun}
                disabled={running || pyLoading}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                  padding: "11px 0",
                  width: 110,
                  border: "none",
                  borderRadius: 13,
                  background: running || pyLoading
                    ? "linear-gradient(180deg,#5EC4A0,#3DAF88)"
                    : "linear-gradient(180deg,#34D9A6,#18C99A)",
                  color: "#fff",
                  fontFamily: "var(--font-jua), 'Jua', sans-serif",
                  fontSize: 15,
                  cursor: running || pyLoading ? "not-allowed" : "pointer",
                  boxShadow: running || pyLoading
                    ? "0 3px 0 #2A8A68"
                    : "0 5px 0 #0FA37C,0 8px 16px rgba(24,201,154,.28)",
                  opacity: running || pyLoading ? 0.8 : 1,
                  transition: "transform .12s,box-shadow .12s,opacity .15s",
                  animation: !hasRun && !running && !pyLoading ? "runPulse 1.8s ease-in-out infinite" : undefined,
                }}
                onMouseDown={(e) => {
                  if (!running && !pyLoading) {
                    (e.currentTarget as HTMLButtonElement).style.transform = "translateY(3px)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 0 #0FA37C";
                  }
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = running || pyLoading
                    ? "0 3px 0 #2A8A68"
                    : "0 5px 0 #0FA37C,0 8px 16px rgba(24,201,154,.28)";
                }}
              >
                {running ? (
                  <>
                    <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      {[0, 0.18, 0.36].map((delay, i) => (
                        <span key={i} style={{
                          width: 5, height: 5, borderRadius: "50%", background: "#fff",
                          display: "inline-block",
                          animation: `dotBounce 0.7s ${delay}s ease-in-out infinite`,
                        }} />
                      ))}
                    </span>
                    실행 중
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="#fff" stroke="none">
                      <path d="M7 4l13 8-13 8z" />
                    </svg>
                    실행
                  </>
                )}
              </button>

              {/* Load example */}
              <button
                onClick={handleLoadExample}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 16px",
                  border: "1.5px solid #ECE7F8",
                  borderRadius: 13,
                  background: "#fff",
                  color: "#7B5CF0",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F2FE")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                예제 불러오기
              </button>

              {/* Load practice */}
              <button
                onClick={handleLoadPractice}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "11px 16px",
                  border: "1.5px solid #E8F5E9",
                  borderRadius: 13,
                  background: "#fff",
                  color: "#18C99A",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "background .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F0FDF4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
              >
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                문제 풀기
              </button>

              {/* Output toggle */}
              {hasRun && (
                <button
                  onClick={() => setShowOutput(!showOutput)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "11px 16px",
                    border: `1.5px solid ${showOutput ? "#7B5CF0" : "#ECE7F8"}`,
                    borderRadius: 13,
                    background: showOutput ? "#F2ECFD" : "#fff",
                    color: showOutput ? "#7B5CF0" : "#A39CC0",
                    fontWeight: 700,
                    fontSize: 13.5,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .13s",
                  }}
                >
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5" />
                    <line x1="12" y1="19" x2="20" y2="19" />
                  </svg>
                  결과 {showOutput ? "닫기" : "보기"}
                </button>
              )}

              {/* Reset */}
              <button
                onClick={handleReset}
                style={{
                  marginLeft: "auto",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "9px 12px",
                  border: "none",
                  borderRadius: 11,
                  background: "transparent",
                  color: "#A39CC0",
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all .13s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#7B5CF0";
                  (e.currentTarget as HTMLButtonElement).style.background = "#F6F2FE";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#A39CC0";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.5 15a9 9 0 1 0 2.1-9.4L1 10" />
                </svg>
                초기화
              </button>

              {pyLoading && (
                <span style={{ fontSize: 11.5, color: "#A39CC0", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 11, height: 11, border: "2px solid #A39CC0", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block" }} />
                  파이썬 로드 중...
                </span>
              )}
              {pyError && <span role="alert" style={{ fontSize: 11.5, color: "#D93668" }}>{pyError}</span>}
            </div>
          </div>

          {/* ── FLOATING OUTPUT PANEL ── */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "44%",
              transform: showOutput ? "translateY(0)" : "translateY(105%)",
              transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)",
              background: "#16172A",
              borderRadius: "18px 18px 0 0",
              boxShadow: showOutput ? "0 -8px 40px rgba(0,0,0,0.28)" : "none",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              pointerEvents: showOutput ? "all" : "none",
            }}
          >
            {/* Panel header */}
            <div
              style={{
                flex: "none",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 16px",
                borderBottom: "1px solid #252640",
                background: "#1E1F36",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: execError ? "#FF5C8A" : "#18C99A",
                  display: "inline-block",
                  boxShadow: execError ? "0 0 6px #FF5C8A88" : "0 0 6px #18C99A88",
                }}
              />
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#6B6B99" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5" />
                <line x1="12" y1="19" x2="20" y2="19" />
              </svg>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "#6B6B99", letterSpacing: 0.5, textTransform: "uppercase" }}>
                실행 결과
              </span>
              <button
                onClick={() => setShowOutput(false)}
                style={{
                  marginLeft: "auto",
                  background: "transparent",
                  border: "none",
                  color: "#4A4A6A",
                  cursor: "pointer",
                  fontSize: 17,
                  lineHeight: 1,
                  padding: "2px 6px",
                  borderRadius: 6,
                  transition: "color .13s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#9B7FFF")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4A4A6A")}
              >
                ✕
              </button>
            </div>

            {/* Output content */}
            <div style={{ flex: 1, overflow: "auto", padding: "14px 18px" }}>
              <OutputPanel output={output} error={execError} hasRun={hasRun} dark />
            </div>
          </div>
        </div>

        {/* ── RIGHT: Robot / DataViz column ── */}
        <div style={{ flex: 0.85, minWidth: 280, display: "flex", flexDirection: "column", gap: 10 }}>
          <div
            style={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              flexDirection: "column",
              background: "linear-gradient(165deg,#FBF7FF,#F3ECFE)",
              borderRadius: 22,
              border: "1px solid #EFEAF8",
              boxShadow: "0 12px 30px rgba(90,63,214,.07)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {mode === "lv3" ? (
              /* ── 데이터 시각화 패널 ── */
              <>
                <div
                  style={{
                    flex: "none",
                    padding: "12px 16px 8px",
                    borderBottom: "1px solid #EFEAF8",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#18C99A" }}>📊 시각화 결과</span>
                  {lv3Loading && (
                    <span style={{ fontSize: 11, color: "#B0A8CC", display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 10, height: 10, border: "2px solid #EFEAF8", borderTopColor: "#18C99A", borderRadius: "50%", display: "inline-block", animation: "spin 0.9s linear infinite" }} />
                      패키지 로딩 중...
                    </span>
                  )}
                </div>
                <DataVizPanel plots={plots} lv3Loading={lv3Loading} />
              </>
            ) : (
            <>
            {/* AI feedback bubble */}
            <div style={{ flex: "none", minHeight: 66, padding: "12px 14px 4px" }}>
              <div
                style={{
                  width: "100%",
                  background: showSpeech ? "#7B5CF0" : "#fff",
                  border: showSpeech ? "none" : "1.5px dashed #C9C1DE",
                  borderRadius: 14,
                  padding: "9px 13px",
                  boxShadow: showSpeech ? "0 6px 14px rgba(123,92,240,.22)" : "none",
                  transition: "all .3s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 48,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    lineHeight: 1.45,
                    color: showSpeech ? "#fff" : "#8B83A8",
                    textAlign: "center",
                  }}
                >
                  {showSpeech ? speechText : "파이썬 코드를 작성하고 실행하면 여기에 힌트와 설명이 나타나요!"}
                </div>
              </div>
            </div>

            {/* Character selector */}
            {mode !== "mechdog" && (
            <div style={{ flex: "none", display: "flex", justifyContent: "center", gap: 5, padding: "2px 14px 8px" }}>
              {(["robot", "dog", "game"] as const).map((type) => {
                const isSelected = characterType === type;
                const labels = { robot: "로봇", dog: "강아지", game: "전사" };
                const icons = { robot: Bot, dog: PawPrint, game: Sword };
                const Icon = icons[type];
                return (
                  <button
                    key={type}
                    onClick={() => setCharacterType(type)}
                    style={{
                      background: isSelected ? "linear-gradient(180deg,#8B6CFF,#7B5CF0)" : "#fff",
                      color: isSelected ? "#fff" : "#8B83A8",
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: "5px 11px",
                      borderRadius: 9,
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 3px 8px rgba(123,92,240,.22)" : "none",
                      border: isSelected ? "none" : "1.5px solid #ECE7F8",
                      transition: "all 0.13s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Icon size={12} />
                    {labels[type]}
                  </button>
                );
              })}
            </div>
            )}

            {/* Robot stage */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                padding: "0 14px 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {pyLoading && mode !== "mechdog" && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(251,247,255,.9)",
                    gap: 12,
                    zIndex: 40,
                    borderRadius: 22,
                  }}
                >
                  <div style={{ width: 38, height: 38, border: "3.5px solid #C6A2EC", borderTopColor: "#7B5CF0", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 13, color: "#8B83A8", margin: 0, fontWeight: 700 }}>파이썬 엔진 로드 중...</p>
                  <p style={{ fontSize: 11.5, color: "#BDB6D4", margin: 0 }}>처음 준비할 때 약 10~30초 소요됩니다.</p>
                </div>
              )}
              {pyLoading && mode === "mechdog" && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 12,
                    zIndex: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    padding: "7px 10px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,.92)",
                    border: "1px solid #F4D3A2",
                    boxShadow: "0 6px 14px rgba(201,123,48,.12)",
                    color: "#C97B30",
                    fontSize: 11.5,
                    fontWeight: 800,
                  }}
                >
                  <span style={{ width: 10, height: 10, border: "2px solid #F6D5AA", borderTopColor: "#C97B30", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  엔진 준비 중
                </div>
              )}

              <RobotStage
                commands={commands}
                onAnimationComplete={handleAnimationComplete}
                varName={varName}
                varValue={varValue}
                showVariable={showVariable}
                characterType={mode === "mechdog" ? "mechdog" : characterType}
                isError={isError}
              />
            </div>
            </>
            )}
          </div>
        </div>
      </div>

      <BadgeCelebration
        badgeIds={newBadgeIds}
        badges={curriculumView.units}
        conceptOrders={levelOrders}
        feedback={badgeFeedback}
        onClose={() => setNewBadgeIds([])}
        onNext={handleGoNextConcept}
      />

      {isStudent && (
        <StudentHintChatbot
          conceptName={displayConcept?.nameKo ?? "자유 학습"}
          conceptDescription={displayConcept?.explanation ?? ""}
          code={code}
          output={output}
          error={execError}
        />
      )}

      {/* 제작사 로고 */}
      <div style={{ position: "fixed", bottom: 14, right: isStudent ? 112 : 18, zIndex: 5, opacity: 0.6 }}>
        <Image
          src="/lifeprofessor-logo.png"
          alt="인생교수의 AI 연구소"
          width={145}
          height={31}
          style={{ objectFit: "contain" }}
        />
      </div>
    </div>
  );
}

function getFriendlyErrorExplanation(stderr: string): string {
  if (!stderr) return "으앙! 코드에 오류가 발생했어. 아래 검은색 결과 창의 빨간색 에러 메시지를 참고해서 고쳐볼래?";

  if (/IndentationError/.test(stderr)) {
    return "들여쓰기(IndentationError)가 잘못되었어요! 코드 줄 앞쪽의 빈칸(스페이스) 개수가 맞는지 확인해 줄래?";
  }
  if (/SyntaxError/.test(stderr)) {
    return "문법 오류(SyntaxError)가 발생했어요! 괄호 짝이 안 맞거나 끝에 콜론(:)이 빠지지 않았는지 살펴봐!";
  }
  if (/NameError/.test(stderr)) {
    const match = stderr.match(/name '([^']+)' is not defined/);
    const missingName = match ? match[1] : "";
    if (missingName === "robot") {
      return "앗! 'import robot'을 코드 맨 위에 적었는지 확인해봐! 나를 사용하려면 꼭 불러와야 해.";
    }
    return `앗, '${missingName}'(은)는 정의되지 않은 이름(NameError)이야! 오타가 났거나 미리 선언하지 않은 것 같아.`;
  }
  if (/TypeError/.test(stderr)) {
    return "서로 다른 종류의 데이터(숫자와 글자 등)를 섞어서 계산(TypeError)하려고 한 것 같아. 타입을 맞춰줘!";
  }
  if (/ZeroDivisionError/.test(stderr)) {
    return "어라? 컴퓨터는 0으로 숫자를 나눌 수 없어(ZeroDivisionError)! 나누는 수를 다른 숫자로 바꿔봐.";
  }
  if (/AttributeError/.test(stderr)) {
    const match = stderr.match(/attribute '([^']+)'/);
    const attr = match ? match[1] : "";
    return `나에게 '${attr}'(이)라는 동작(AttributeError)은 존재하지 않아! 내가 할 수 있는 동작 이름을 다시 확인해봐.`;
  }

  return "코드에 에러가 발생해서 동작을 완료하지 못했어. 아래 빨간색 에러 메시지를 잘 읽고 코드를 수정해보자!";
}
