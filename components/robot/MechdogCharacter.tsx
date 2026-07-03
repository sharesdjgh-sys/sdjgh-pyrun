"use client";

import { motion, TargetAndTransition } from "framer-motion";
import type { RobotState, RobotEmotion } from "@/types";

interface MechdogCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
  /** 실행 중인 mechdog 액션 이름 (예: "handshake"). 없으면 null */
  action?: string | null;
  /** 초음파 센서 RGB LED 색상 (예: "rgb(255,0,0)") */
  ledColor?: string | null;
}

// 관절 파트 키: body(몸통 전체), head(초음파 센서 헤드),
// t=허벅지(hip 관절), s=정강이(knee 관절) / F=앞, R=뒤 / N=앞쪽(near), F=먼쪽(far)
const PART_KEYS = ["body", "head", "tFN", "sFN", "tFF", "sFF", "tRN", "sRN", "tRF", "sRF"] as const;
type PartKey = (typeof PART_KEYS)[number];
type Rig = Partial<Record<PartKey, TargetAndTransition>>;

const hold = (d = 0.55) => ({ duration: d, ease: "easeInOut" as const });

const NEUTRAL: Record<PartKey, TargetAndTransition> = {
  body: { x: 0, y: 0, rotate: 0, skewY: 0, transition: hold(0.45) },
  head: { rotate: 0, transition: hold(0.4) },
  tFN: { rotate: 0, transition: hold(0.35) },
  sFN: { rotate: 0, transition: hold(0.35) },
  tFF: { rotate: 0, transition: hold(0.35) },
  sFF: { rotate: 0, transition: hold(0.35) },
  tRN: { rotate: 0, transition: hold(0.35) },
  sRN: { rotate: 0, transition: hold(0.35) },
  tRF: { rotate: 0, transition: hold(0.35) },
  sRF: { rotate: 0, transition: hold(0.35) },
};

// ── 트로트 보행: 대각선 다리 쌍(앞near+뒤far / 앞far+뒤near)이 반주기 어긋나게 움직임
const GAIT = { duration: 0.5, repeat: Infinity, ease: "easeInOut" as const };
const WALKING: Rig = {
  body: { y: [0, -2.5, 0], transition: { duration: 0.25, repeat: Infinity, ease: "easeInOut" } },
  tFN: { rotate: [-10, 10, -10], transition: GAIT },
  sFN: { rotate: [8, -12, 8], transition: GAIT },
  tRF: { rotate: [-10, 10, -10], transition: GAIT },
  sRF: { rotate: [8, -12, 8], transition: GAIT },
  tFF: { rotate: [10, -10, 10], transition: GAIT },
  sFF: { rotate: [-12, 8, -12], transition: GAIT },
  tRN: { rotate: [10, -10, 10], transition: GAIT },
  sRN: { rotate: [-12, 8, -12], transition: GAIT },
};

const STATE_RIGS: Partial<Record<RobotState, Rig>> = {
  idle: {
    body: { y: [0, -2.2, 0], rotate: [0, 0.8, 0, -0.6, 0], transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
    head: { rotate: [0, 3.5, 0, -2.5, 0], transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" } },
  },
  talking: {
    body: { y: [0, -1.5, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } },
    head: { rotate: [0, 4, -2, 4, 0], transition: { duration: 0.8, repeat: Infinity } },
  },
  walking: WALKING,
  jumping: {
    body: { y: [0, -46, -46, 0], transition: { duration: 0.6, ease: "easeOut" } },
    tFN: { rotate: [0, -18, -18, 0], transition: { duration: 0.6 } },
    tFF: { rotate: [0, -18, -18, 0], transition: { duration: 0.6 } },
    tRN: { rotate: [0, -18, -18, 0], transition: { duration: 0.6 } },
    tRF: { rotate: [0, -18, -18, 0], transition: { duration: 0.6 } },
    sFN: { rotate: [0, 34, 34, 0], transition: { duration: 0.6 } },
    sFF: { rotate: [0, 34, 34, 0], transition: { duration: 0.6 } },
    sRN: { rotate: [0, 34, 34, 0], transition: { duration: 0.6 } },
    sRF: { rotate: [0, 34, 34, 0], transition: { duration: 0.6 } },
  },
  celebrating: {
    body: { y: [0, -9, 0], rotate: [0, 3, -3, 0], transition: { duration: 0.8, repeat: 2, ease: "easeInOut" } },
    tFN: { rotate: [0, 60, 0], transition: { duration: 0.8, repeat: 2 } },
    sFN: { rotate: [0, -20, 0], transition: { duration: 0.8, repeat: 2 } },
    tFF: { rotate: [0, 60, 0], transition: { duration: 0.8, repeat: 2 } },
    sFF: { rotate: [0, -20, 0], transition: { duration: 0.8, repeat: 2 } },
  },
  headShake: {
    head: { rotate: [0, 8, -8, 8, 0], transition: { duration: 0.5 } },
  },
  error: {
    body: { y: 5, rotate: 2, transition: hold(0.4) },
    head: { rotate: 10, transition: hold(0.4) },
  },
  // spinning / shaking 은 RobotStage 의 wrapper motion 이 처리
};

// ── mechdog 프리셋 액션별 관절 포즈 (지속시간은 RobotStage ACTION_MAP 의 ms 와 맞춤)
// 부호 규칙(SVG 좌표 기준 머리는 왼쪽): body·head rotate + = 코가 위로 / − = 코가 아래로,
// 허벅지(t*) rotate + = 다리를 앞(머리쪽)으로 스윙 / − = 뒤로 스윙,
// 정강이(s*) rotate + = 발을 앞으로 접음 / − = 다리를 곧게 폄.
// 지면 y≈154, 다리 최대 길이 66px(near) 를 기준으로 발이 땅에 닿도록 각도를 계산함.
const PRESS_UP_T = { duration: 1.9, ease: "easeInOut" as const };
const BOX_T = { duration: 2.0, ease: "easeInOut" as const };
const BOW_T = { duration: 1.4, ease: "easeInOut" as const };
const STRETCH_T = { duration: 1.5, ease: "easeInOut" as const };
const SHAKE_T = { duration: 1.5, ease: "easeInOut" as const };
const KICK_T = { duration: 0.95, ease: "easeInOut" as const };

const ACTIONS: Record<string, Rig> = {
  default_pose: { body: { y: [0, 3, 0], transition: { duration: 0.6 } } },
  stand_four_legs: { body: { y: [0, 3, 0], transition: { duration: 0.6 } } },

  // 앉기: 엉덩이를 바닥에 붙이고 상체를 세움. 앞다리는 곧게 세워 지지, 뒷다리는 접음
  sit_down: {
    body: { rotate: 28, y: 16, x: 6, transition: hold(0.7) },
    head: { rotate: -14, transition: hold(0.7) },
    tFN: { rotate: 4, transition: hold(0.7) },
    sFN: { rotate: -56, transition: hold(0.7) },
    tFF: { rotate: 4, transition: hold(0.7) },
    sFF: { rotate: -56, transition: hold(0.7) },
    tRN: { rotate: 34, transition: hold(0.7) },
    sRN: { rotate: -2, transition: hold(0.7) },
    tRF: { rotate: 34, transition: hold(0.7) },
    sRF: { rotate: -2, transition: hold(0.7) },
  },

  // 엎드리기(스핑크스 자세): 네 다리를 몸통 아래로 접고 배를 바닥 가까이 낮춤
  go_prone: {
    body: { y: 25, rotate: 0, transition: hold(0.65) },
    head: { rotate: -6, transition: hold(0.65) },
    tFN: { rotate: 15, transition: hold(0.65) },
    sFN: { rotate: 43, transition: hold(0.65) },
    tFF: { rotate: 15, transition: hold(0.65) },
    sFF: { rotate: 43, transition: hold(0.65) },
    tRN: { rotate: 15, transition: hold(0.65) },
    sRN: { rotate: 43, transition: hold(0.65) },
    tRF: { rotate: 15, transition: hold(0.65) },
    sRF: { rotate: 43, transition: hold(0.65) },
  },

  // 두 발로 서기: 뒷다리를 곧게 펴 지면을 딛고 몸통을 세움. 앞다리는 가슴 앞에 늘어뜨림
  stand_two_legs: {
    body: { rotate: 50, x: 6, y: -34, transition: hold(0.85) },
    head: { rotate: -26, transition: hold(0.85) },
    tRN: { rotate: -20, transition: hold(0.85) },
    sRN: { rotate: -57, transition: hold(0.85) },
    tRF: { rotate: -20, transition: hold(0.85) },
    sRF: { rotate: -57, transition: hold(0.85) },
    tFN: { rotate: 10, transition: hold(0.85) },
    sFN: { rotate: -60, transition: hold(0.85) },
    tFF: { rotate: 10, transition: hold(0.85) },
    sFF: { rotate: -60, transition: hold(0.85) },
  },

  // 악수: 엉덩이를 낮춰 앉고 앞쪽(near) 앞다리를 앞으로 뻗어 위아래로 흔듦
  handshake: {
    body: { rotate: 18, y: 10, x: 4, transition: hold(0.5) },
    head: { rotate: -6, transition: hold(0.5) },
    tRN: { rotate: 26, transition: hold(0.5) },
    sRN: { rotate: 6, transition: hold(0.5) },
    tRF: { rotate: 26, transition: hold(0.5) },
    sRF: { rotate: 6, transition: hold(0.5) },
    tFF: { rotate: 10, transition: hold(0.5) },
    sFF: { rotate: -40, transition: hold(0.5) },
    tFN: { rotate: [0, 86, 78, 88, 78, 86], transition: SHAKE_T },
    sFN: { rotate: [0, -54, -44, -58, -44, -54], transition: SHAKE_T },
  },

  // 인사(플레이 바우): 가슴을 낮추고 앞다리를 앞으로 뻗으며 엉덩이는 높게 유지
  scrape_a_bow: {
    body: { rotate: [0, -16, -16, 0], y: [0, 4, 4, 0], transition: BOW_T },
    head: { rotate: [0, -10, -10, 0], transition: BOW_T },
    tFN: { rotate: [0, 30, 30, 0], transition: BOW_T },
    sFN: { rotate: [0, 38, 38, 0], transition: BOW_T },
    tFF: { rotate: [0, 30, 30, 0], transition: BOW_T },
    sFF: { rotate: [0, 38, 38, 0], transition: BOW_T },
    tRN: { rotate: [0, 20, 20, 0], transition: BOW_T },
    sRN: { rotate: [0, -40, -40, 0], transition: BOW_T },
    tRF: { rotate: [0, 20, 20, 0], transition: BOW_T },
    sRF: { rotate: [0, -40, -40, 0], transition: BOW_T },
  },

  // 고개 끄덕이기: 코를 아래로 두 번 까딱
  nodding_motion: {
    body: { y: [0, 1.5, 0, 1.5, 0], transition: { duration: 1.1, ease: "easeInOut" } },
    head: { rotate: [0, -20, -4, -20, 0], transition: { duration: 1.1, ease: "easeInOut" } },
  },

  // 권투: 상체를 세우고 앉아 양 앞발로 번갈아 앞을 향해 펀치
  boxing: {
    body: { rotate: [22, 24, 22, 24, 22, 22], y: [12, 11, 12, 11, 12, 12], x: [4, 0, 4, 0, 4, 4], transition: BOX_T },
    head: { rotate: [-10, -6, -10, -6, -10, -10], transition: BOX_T },
    tRN: { rotate: 30, transition: hold(0.5) },
    sRN: { rotate: 0, transition: hold(0.5) },
    tRF: { rotate: 30, transition: hold(0.5) },
    sRF: { rotate: 0, transition: hold(0.5) },
    tFN: { rotate: [45, 88, 45, 88, 45, 45], transition: BOX_T },
    sFN: { rotate: [40, -55, 40, -55, 40, 40], transition: BOX_T },
    tFF: { rotate: [45, 45, 88, 45, 88, 45], transition: BOX_T },
    sFF: { rotate: [40, 40, -55, 40, -55, 40], transition: BOX_T },
  },

  // 기지개: 앞다리를 앞으로 쭉 뻗어 가슴을 낮추고 엉덩이를 들어 올림
  stretch_oneself: {
    body: { rotate: [0, -15, -13], y: [0, 5, 4], x: [0, -6, -5], transition: STRETCH_T },
    head: { rotate: [0, -12, -8], transition: STRETCH_T },
    tFN: { rotate: [0, 40, 38], transition: STRETCH_T },
    sFN: { rotate: [0, 22, 20], transition: STRETCH_T },
    tFF: { rotate: [0, 40, 38], transition: STRETCH_T },
    sFF: { rotate: [0, 22, 20], transition: STRETCH_T },
    tRN: { rotate: [0, 16, 14], transition: STRETCH_T },
    sRN: { rotate: [0, -42, -40], transition: STRETCH_T },
    tRF: { rotate: [0, 16, 14], transition: STRETCH_T },
    sRF: { rotate: [0, -42, -40], transition: STRETCH_T },
  },

  // 쉬: 뒤쪽(far) 뒷다리를 옆·위로 들어 올리고 나머지 세 다리로 지지
  pee: {
    body: { rotate: -4, x: -4, y: 2, transition: hold(0.55) },
    head: { rotate: 6, transition: hold(0.55) },
    tFN: { rotate: -4, transition: hold(0.55) },
    sFN: { rotate: 4, transition: hold(0.55) },
    tFF: { rotate: -4, transition: hold(0.55) },
    sFF: { rotate: 4, transition: hold(0.55) },
    tRN: { rotate: 4, transition: hold(0.55) },
    sRN: { rotate: -4, transition: hold(0.55) },
    tRF: { rotate: -70, transition: hold(0.55) },
    sRF: { rotate: -6, transition: hold(0.55) },
  },

  // 팔굽혀펴기: 네 다리를 굽혔다 펴며 몸통이 두 번 내려갔다 올라옴
  press_up: {
    body: { y: [0, 14, 2, 14, 0], transition: PRESS_UP_T },
    tFN: { rotate: [0, -16, -2, -16, 0], transition: PRESS_UP_T },
    sFN: { rotate: [0, 30, 4, 30, 0], transition: PRESS_UP_T },
    tFF: { rotate: [0, -16, -2, -16, 0], transition: PRESS_UP_T },
    sFF: { rotate: [0, 30, 4, 30, 0], transition: PRESS_UP_T },
    tRN: { rotate: [0, -16, -2, -16, 0], transition: PRESS_UP_T },
    sRN: { rotate: [0, 30, 4, 30, 0], transition: PRESS_UP_T },
    tRF: { rotate: [0, -16, -2, -16, 0], transition: PRESS_UP_T },
    sRF: { rotate: [0, 30, 4, 30, 0], transition: PRESS_UP_T },
  },

  rotation_pitch: {
    body: { rotate: [0, 9, -9, 9, -9, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },
  rotation_roll: {
    body: { skewY: [0, 6, -6, 6, -6, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },

  // 발차기: 몸을 뒤로 살짝 기울이고 앞다리 하나를 앞으로 쭉 뻗어 참
  left_foot_kick: {
    body: { rotate: [0, 6, 8, 4, 0], x: [0, 3, 5, 2, 0], transition: KICK_T },
    tFN: { rotate: 6, transition: hold(0.3) },
    sFN: { rotate: -6, transition: hold(0.3) },
    tRN: { rotate: 14, transition: hold(0.3) },
    sRN: { rotate: -10, transition: hold(0.3) },
    tRF: { rotate: 14, transition: hold(0.3) },
    sRF: { rotate: -10, transition: hold(0.3) },
    tFF: { rotate: [0, 45, 90, 30, 0], transition: KICK_T },
    sFF: { rotate: [0, 10, -52, 6, 0], transition: KICK_T },
  },
  right_foot_kick: {
    body: { rotate: [0, 6, 8, 4, 0], x: [0, 3, 5, 2, 0], transition: KICK_T },
    tFF: { rotate: 6, transition: hold(0.3) },
    sFF: { rotate: -6, transition: hold(0.3) },
    tRN: { rotate: 14, transition: hold(0.3) },
    sRN: { rotate: -10, transition: hold(0.3) },
    tRF: { rotate: 14, transition: hold(0.3) },
    sRF: { rotate: -10, transition: hold(0.3) },
    tFN: { rotate: [0, 45, 90, 30, 0], transition: KICK_T },
    sFN: { rotate: [0, 10, -52, 6, 0], transition: KICK_T },
  },

  // ── transform() 자세 조절 (RobotStage 가 tz/pitch/roll 값에 따라 pseudo 액션명으로 전달)
  transform_up: {
    body: { y: -7, transition: hold(0.6) },
    tFN: { rotate: 6, transition: hold(0.6) },
    sFN: { rotate: -18, transition: hold(0.6) },
    tFF: { rotate: 6, transition: hold(0.6) },
    sFF: { rotate: -18, transition: hold(0.6) },
    tRN: { rotate: 6, transition: hold(0.6) },
    sRN: { rotate: -18, transition: hold(0.6) },
    tRF: { rotate: 6, transition: hold(0.6) },
    sRF: { rotate: -18, transition: hold(0.6) },
  },
  transform_down: {
    body: { y: 10, transition: hold(0.6) },
    tFN: { rotate: -18, transition: hold(0.6) },
    sFN: { rotate: 30, transition: hold(0.6) },
    tFF: { rotate: -18, transition: hold(0.6) },
    sFF: { rotate: 30, transition: hold(0.6) },
    tRN: { rotate: -18, transition: hold(0.6) },
    sRN: { rotate: 30, transition: hold(0.6) },
    tRF: { rotate: -18, transition: hold(0.6) },
    sRF: { rotate: 30, transition: hold(0.6) },
  },
  transform_pitch_fwd: { body: { rotate: -10, transition: hold(0.5) } },
  transform_pitch_back: { body: { rotate: 10, transition: hold(0.5) } },
  transform_roll_right: { body: { skewY: 7, transition: hold(0.5) } },
  transform_roll_left: { body: { skewY: -7, transition: hold(0.5) } },

  // 균형 유지: IMU 가 자세를 미세 교정하는 모습
  homeostasis_on: {
    body: { rotate: [0, 2.5, -2.5, 1.5, 0], y: [0, -2, 1, -1, 0], transition: { duration: 0.75 } },
    sFN: { rotate: [0, 7, -7, 3, 0], transition: { duration: 0.75 } },
    sFF: { rotate: [0, -7, 7, -3, 0], transition: { duration: 0.75 } },
    sRN: { rotate: [0, 7, -7, 3, 0], transition: { duration: 0.75 } },
    sRF: { rotate: [0, -7, 7, -3, 0], transition: { duration: 0.75 } },
  },
};
ACTIONS.sit_dowm = ACTIONS.sit_down; // 실제 mechdog SDK 의 오타 액션명 호환

const FALLBACK_ACTION: Rig = {
  body: { y: [0, -12, 0], transition: { duration: 0.5, ease: "easeOut" } },
};

type Pt = { x: number; y: number };

const linkEnd = (hip: Pt, angleDeg: number, length: number): Pt => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: Math.round((hip.x + Math.cos(rad) * length) * 10) / 10,
    y: Math.round((hip.y + Math.sin(rad) * length) * 10) / 10,
  };
};

const YELLOW = "#F4AC22";
const YELLOW_LIGHT = "#FFE07B";
const YELLOW_DARK = "#B97008";
const YELLOW_SIDE = "#D98913";
const BLACK = "#15181D";
const BLACK_SOFT = "#2B3037";
const STEEL = "#D7DEE6";
const BOLT = "#1D2229";

export default function MechdogCharacter({
  state,
  scale = 1.0,
  direction = "right",
  size = 70,
  action = null,
  ledColor = null,
}: MechdogCharacterProps) {
  const isError = state === "error";
  const w = Math.round(size * 1.95);
  const h = Math.round(w * (170 / 250));
  const directionScaleX = direction === "right" ? -1 : 1;

  // 액션이 최우선, 없으면 상태(걷기/점프 등) 리그 사용
  const override: Rig = (action ? ACTIONS[action] ?? FALLBACK_ACTION : undefined) ?? STATE_RIGS[state] ?? {};
  const rig = {} as Record<PartKey, TargetAndTransition>;
  for (const k of PART_KEYS) rig[k] = override[k] ?? NEUTRAL[k];

  const sensorColor = isError ? "#EF4444" : ledColor ?? "#4A525C";
  const eyeFill = isError ? "#EF4444" : "#323A45";

  const renderLeg = (hip: Pt, knee: Pt, foot: Pt, thighKey: PartKey, shinKey: PartKey, far = false) => {
    const sideYellow = far ? "#C97912" : YELLOW;
    const sideBlack = far ? "#0F1216" : BLACK;
    const alpha = far ? 0.76 : 1;
    const lowerDir = foot.x < knee.x ? -1 : 1;

    return (
      <motion.g animate={rig[thighKey]} style={{ originX: `${hip.x}px`, originY: `${hip.y}px`, transformBox: "view-box" }} opacity={alpha}>
        <line
          x1={hip.x}
          y1={hip.y}
          x2={knee.x}
          y2={knee.y}
          stroke={YELLOW_DARK}
          strokeWidth="18"
          strokeLinecap="round"
        />
        <line
          x1={hip.x}
          y1={hip.y}
          x2={knee.x}
          y2={knee.y}
          stroke={sideYellow}
          strokeWidth="14"
          strokeLinecap="round"
        />
        <circle cx={hip.x} cy={hip.y} r="7.2" fill={sideYellow} stroke={YELLOW_DARK} strokeWidth="1.8" />
        <circle cx={hip.x} cy={hip.y} r="3" fill={BLACK_SOFT} />
        <circle cx={knee.x} cy={knee.y} r="7.4" fill={sideYellow} stroke={YELLOW_DARK} strokeWidth="1.8" />

        <motion.g animate={rig[shinKey]} style={{ originX: `${knee.x}px`, originY: `${knee.y}px`, transformBox: "view-box" }}>
          <line
            x1={knee.x}
            y1={knee.y + 2}
            x2={foot.x}
            y2={foot.y}
            stroke={sideBlack}
            strokeWidth="11"
            strokeLinecap="round"
          />
          <line
            x1={knee.x + lowerDir * 8}
            y1={knee.y}
            x2={foot.x + lowerDir * 7}
            y2={foot.y - 11}
            stroke={STEEL}
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.8"
          />
          <ellipse cx={foot.x + lowerDir * 2} cy={foot.y + 2} rx="14" ry="6.5" fill={sideBlack} transform={`rotate(${lowerDir > 0 ? -14 : 14} ${foot.x + lowerDir * 2} ${foot.y + 2})`} />
          <ellipse cx={foot.x + lowerDir * 5} cy={foot.y - 1} rx="5" ry="2.3" fill="#4B525C" opacity="0.8" transform={`rotate(${lowerDir > 0 ? -14 : 14} ${foot.x + lowerDir * 5} ${foot.y - 1})`} />
          <circle cx={knee.x} cy={knee.y} r="5.8" fill={BLACK_SOFT} />
          <circle cx={knee.x} cy={knee.y} r="2.2" fill={STEEL} />
        </motion.g>
      </motion.g>
    );
  };

  return (
    <motion.div
      style={{
        width: w,
        height: h,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        scaleX: directionScaleX * scale,
        scaleY: scale,
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 250 170"
        width={w}
        height={h}
        preserveAspectRatio="xMidYMax meet"
        style={{
          overflow: "visible",
          filter: isError ? "drop-shadow(0 8px 8px rgba(239,68,68,.20))" : "drop-shadow(0 10px 9px rgba(72,55,36,.16))",
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse cx="128" cy="154" rx="82" ry="8" fill="#4A3824" opacity="0.13" />

        <motion.g animate={rig.body} style={{ originX: "126px", originY: "86px", transformBox: "view-box" }}>
          {renderLeg(
            { x: 88, y: 96 },
            linkEnd({ x: 88, y: 96 }, 60, 31),
            linkEnd(linkEnd({ x: 88, y: 96 }, 60, 31), 122, 31),
            "tFF",
            "sFF",
            true
          )}
          {renderLeg(
            { x: 154, y: 96 },
            linkEnd({ x: 154, y: 96 }, 60, 31),
            linkEnd(linkEnd({ x: 154, y: 96 }, 60, 31), 122, 31),
            "tRF",
            "sRF",
            true
          )}

          {/* soft tail */}
          <motion.g animate={{ rotate: [0, 9, -6, 0], transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }} style={{ originX: "190px", originY: "76px", transformBox: "view-box" }}>
            <path d="M186 78 C205 66, 216 72, 214 86" fill="none" stroke={YELLOW_DARK} strokeWidth="8" strokeLinecap="round" />
            <circle cx="215" cy="87" r="5" fill={YELLOW_LIGHT} stroke={YELLOW_DARK} strokeWidth="1.5" />
          </motion.g>

          {/* main rounded puppy body */}
          <path
            d="M66 61 Q77 47 99 46 H160 Q180 47 190 63 L185 98 Q177 110 154 108 H82 Q64 107 56 91 Z"
            fill={YELLOW}
            stroke={YELLOW_DARK}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M81 52 H160 Q174 53 183 64 H67 Q73 56 81 52 Z" fill={YELLOW_LIGHT} opacity="0.62" />
          <path d="M68 66 H184 L181 80 H61 Z" fill="#FFC64A" opacity="0.44" />

          {/* cute top panel */}
          <path d="M83 38 H149 Q164 39 174 50 L160 58 H68 Q72 44 83 38 Z" fill="#F6B932" stroke={YELLOW_DARK} strokeWidth="1.8" strokeLinejoin="round" />
          {[88, 102, 116, 130, 144, 158].map((x, i) => (
            <rect key={`slot-${x}`} x={x} y={i > 3 ? 49 : 43} width="7" height="3" rx="1.5" fill="#8F5709" opacity="0.7" />
          ))}
          {[82, 108, 136].map((x) => (
            <circle key={`hole-${x}`} cx={x} cy="52" r="2.2" fill="#8F5709" opacity="0.7" />
          ))}

          {/* side triangular truss and name plate */}
          <path d="M95 71 L109 95 H80 Z M129 71 L144 95 H115 Z" fill="none" stroke="#603A08" strokeWidth="3" strokeLinejoin="round" opacity="0.58" />
          <rect x="111" y="63" width="47" height="13" rx="5" fill="#2E333B" />
          <text x="134" y="72.5" textAnchor="middle" fontSize="6" fontWeight="800" fill="#D7DEE6">K-09</text>
          <path d="M72 101 H176" stroke={YELLOW_DARK} strokeWidth="7" strokeLinecap="round" opacity="0.72" />

          {[77, 94, 166, 177, 83, 154].map((x, i) => (
            <circle key={`bolt-${i}`} cx={x} cy={i < 4 ? 62 : 92} r="2.2" fill={BOLT} />
          ))}

          {/* rounded shoulders */}
          <circle cx="78" cy="89" r="13" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="2" />
          <circle cx="164" cy="89" r="13" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="2" />
          <circle cx="78" cy="89" r="4" fill={BLACK_SOFT} />
          <circle cx="164" cy="89" r="4" fill={BLACK_SOFT} />

          {renderLeg(
            { x: 78, y: 97 },
            linkEnd({ x: 78, y: 97 }, 60, 33),
            linkEnd(linkEnd({ x: 78, y: 97 }, 60, 33), 122, 33),
            "tFN",
            "sFN",
            false
          )}
          {renderLeg(
            { x: 164, y: 97 },
            linkEnd({ x: 164, y: 97 }, 60, 33),
            linkEnd(linkEnd({ x: 164, y: 97 }, 60, 33), 122, 33),
            "tRN",
            "sRN",
            false
          )}

          {/* puppy-like sensor head */}
          <motion.g animate={rig.head} style={{ originX: "55px", originY: "73px", transformBox: "view-box" }}>
            <path d="M23 58 Q32 42 51 39 H76 Q91 41 98 58 L92 91 Q83 102 38 98 Q25 93 18 79 Z" fill={YELLOW} stroke={YELLOW_DARK} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M25 57 Q20 45 27 38 Q38 43 43 52 Z" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="1.8" />
            <path d="M82 52 Q88 41 99 37 Q104 48 96 60 Z" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="1.8" />
            <path d="M51 39 H76 Q90 43 98 58 H28 Q36 45 51 39 Z" fill={YELLOW_LIGHT} opacity="0.76" />
            <path d="M28 62 Q58 56 88 62 L84 89 Q58 94 32 89 Z" fill="#111418" opacity="0.86" />
            <circle cx="34" cy="86" r="4" fill="#FFB4C7" opacity="0.95" />
            <circle cx="80" cy="86" r="4" fill="#FFB4C7" opacity="0.95" />
            <g style={ledColor || isError ? { filter: `drop-shadow(0 0 7px ${sensorColor})` } : undefined}>
              <ellipse cx="47" cy="73" rx="13" ry="14.2" fill="#0D1014" stroke={sensorColor} strokeWidth="3" />
              <ellipse cx="47" cy="73" rx="8" ry="9" fill={eyeFill} />
              <circle cx="43" cy="68" r="3.2" fill="#F8FBFF" opacity="0.98" />
              <ellipse cx="72" cy="73" rx="13" ry="14.2" fill="#0D1014" stroke={sensorColor} strokeWidth="3" />
              <ellipse cx="72" cy="73" rx="8" ry="9" fill={eyeFill} />
              <circle cx="68" cy="68" r="3.2" fill="#F8FBFF" opacity="0.98" />
            </g>
            <path d="M51 90 Q60 96 70 90" fill="none" stroke="#744607" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M36 58 Q47 53 58 58" fill="none" stroke="#FFE9A8" strokeWidth="2" strokeLinecap="round" opacity="0.82" />
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
