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
    tFN: { rotate: [0, -40, 0], transition: { duration: 0.8, repeat: 2 } },
    tFF: { rotate: [0, -40, 0], transition: { duration: 0.8, repeat: 2 } },
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
const PRESS_UP_T = { duration: 1.9, ease: "easeInOut" as const };
const BOX_T = { duration: 1.9, ease: "easeInOut" as const };

const ACTIONS: Record<string, Rig> = {
  default_pose: { body: { y: [0, 3, 0], transition: { duration: 0.6 } } },
  stand_four_legs: { body: { y: [0, 3, 0], transition: { duration: 0.6 } } },

  // 앉기: 몸통 뒤로 기울이고 뒷다리 접기
  sit_down: {
    body: { rotate: -8, y: 8, transition: hold(0.6) },
    head: { rotate: -5, transition: hold(0.6) },
    tRN: { rotate: -18, transition: hold(0.6) },
    sRN: { rotate: 26, transition: hold(0.6) },
    tRF: { rotate: -18, transition: hold(0.6) },
    sRF: { rotate: 26, transition: hold(0.6) },
    tFN: { rotate: 8, transition: hold(0.6) },
    sFN: { rotate: -8, transition: hold(0.6) },
    tFF: { rotate: 8, transition: hold(0.6) },
    sFF: { rotate: -8, transition: hold(0.6) },
  },

  // 엎드리기: 네 다리 모두 접고 몸통 낮추기
  go_prone: {
    body: { y: 14, transition: hold(0.6) },
    head: { rotate: 4, transition: hold(0.6) },
    tFN: { rotate: -16, transition: hold(0.6) },
    sFN: { rotate: 28, transition: hold(0.6) },
    tFF: { rotate: -16, transition: hold(0.6) },
    sFF: { rotate: 28, transition: hold(0.6) },
    tRN: { rotate: -16, transition: hold(0.6) },
    sRN: { rotate: 28, transition: hold(0.6) },
    tRF: { rotate: -16, transition: hold(0.6) },
    sRF: { rotate: 28, transition: hold(0.6) },
  },

  // 두 발로 서기: 몸통 세우고 앞다리 들기
  stand_two_legs: {
    body: { rotate: -22, x: -5, y: -8, transition: hold(0.8) },
    head: { rotate: 9, transition: hold(0.8) },
    tRN: { rotate: 20, transition: hold(0.8) },
    sRN: { rotate: -12, transition: hold(0.8) },
    tRF: { rotate: 20, transition: hold(0.8) },
    sRF: { rotate: -12, transition: hold(0.8) },
    tFN: { rotate: -18, transition: hold(0.8) },
    sFN: { rotate: 24, transition: hold(0.8) },
    tFF: { rotate: -18, transition: hold(0.8) },
    sFF: { rotate: 24, transition: hold(0.8) },
  },

  // 악수: 뒤로 살짝 앉고 앞쪽 다리를 들어 위아래로 흔들기
  handshake: {
    body: { rotate: -5, y: 4, transition: hold(0.4) },
    tRN: { rotate: -10, transition: hold(0.4) },
    sRN: { rotate: 14, transition: hold(0.4) },
    tRF: { rotate: -10, transition: hold(0.4) },
    sRF: { rotate: 14, transition: hold(0.4) },
    tFF: { rotate: 5, transition: hold(0.4) },
    tFN: { rotate: [0, 22, 18, 22, 18, 12], transition: { duration: 1.4, ease: "easeInOut" } },
    sFN: { rotate: [0, -10, 10, -10, 10, 0], transition: { duration: 1.4, ease: "easeInOut" } },
  },

  // 인사(절): 앞다리 굽히고 앞으로 숙이기
  scrape_a_bow: {
    body: { rotate: 8, y: 6, transition: hold(0.55) },
    head: { rotate: [0, 12, 12, 0], transition: { duration: 1.1 } },
    tFN: { rotate: 12, transition: hold(0.55) },
    sFN: { rotate: 22, transition: hold(0.55) },
    tFF: { rotate: 12, transition: hold(0.55) },
    sFF: { rotate: 22, transition: hold(0.55) },
    tRN: { rotate: -6, transition: hold(0.55) },
    sRN: { rotate: 4, transition: hold(0.55) },
    tRF: { rotate: -6, transition: hold(0.55) },
    sRF: { rotate: 4, transition: hold(0.55) },
  },

  nodding_motion: {
    head: { rotate: [0, 16, 2, 16, 0], transition: { duration: 0.95, ease: "easeInOut" } },
  },

  // 권투: 뒤로 앉아 앞다리 두 개로 번갈아 펀치
  boxing: {
    body: { rotate: -8, y: 5, transition: hold(0.4) },
    tRN: { rotate: -12, transition: hold(0.4) },
    sRN: { rotate: 16, transition: hold(0.4) },
    tRF: { rotate: -12, transition: hold(0.4) },
    sRF: { rotate: 16, transition: hold(0.4) },
    tFN: { rotate: [0, -18, -30, -18, -30, -18], transition: BOX_T },
    sFN: { rotate: [0, 12, -8, 12, -8, 12], transition: BOX_T },
    tFF: { rotate: [0, -30, -18, -30, -18, -30], transition: BOX_T },
    sFF: { rotate: [0, -8, 12, -8, 12, -8], transition: BOX_T },
  },

  // 기지개: 앞다리 앞으로 뻗어 가슴 낮추고 엉덩이 들기
  stretch_oneself: {
    body: { rotate: 8, y: 3, transition: hold(0.6) },
    head: { rotate: -8, transition: hold(0.6) },
    tFN: { rotate: -18, transition: hold(0.6) },
    sFN: { rotate: -10, transition: hold(0.6) },
    tFF: { rotate: -18, transition: hold(0.6) },
    sFF: { rotate: -10, transition: hold(0.6) },
    tRN: { rotate: 5, transition: hold(0.6) },
    sRN: { rotate: -4, transition: hold(0.6) },
    tRF: { rotate: 5, transition: hold(0.6) },
    sRF: { rotate: -4, transition: hold(0.6) },
  },

  // 쉬: 뒷다리 한쪽 들기
  pee: {
    body: { rotate: 2, transition: hold(0.5) },
    head: { rotate: -4, transition: hold(0.5) },
    tRN: { rotate: -24, transition: hold(0.5) },
    sRN: { rotate: 22, transition: hold(0.5) },
  },

  // 팔굽혀펴기: 몸통이 두 번 내려갔다 올라오고 다리가 함께 굽혀짐
  press_up: {
    body: { y: [0, 11, 2, 11, 0], transition: PRESS_UP_T },
    tFN: { rotate: [0, -10, -2, -10, 0], transition: PRESS_UP_T },
    sFN: { rotate: [0, 20, 4, 20, 0], transition: PRESS_UP_T },
    tFF: { rotate: [0, -10, -2, -10, 0], transition: PRESS_UP_T },
    sFF: { rotate: [0, 20, 4, 20, 0], transition: PRESS_UP_T },
    tRN: { rotate: [0, -10, -2, -10, 0], transition: PRESS_UP_T },
    sRN: { rotate: [0, 20, 4, 20, 0], transition: PRESS_UP_T },
    tRF: { rotate: [0, -10, -2, -10, 0], transition: PRESS_UP_T },
    sRF: { rotate: [0, 20, 4, 20, 0], transition: PRESS_UP_T },
  },

  rotation_pitch: {
    body: { rotate: [0, 9, -9, 9, -9, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },
  rotation_roll: {
    body: { skewY: [0, 6, -6, 6, -6, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },

  left_foot_kick: {
    body: { rotate: -4, transition: hold(0.3) },
    tFF: { rotate: [0, -28, -28, 0], transition: { duration: 0.95, ease: "easeInOut" } },
    sFF: { rotate: [0, 14, -10, 0], transition: { duration: 0.95, ease: "easeInOut" } },
  },
  right_foot_kick: {
    body: { rotate: -4, transition: hold(0.3) },
    tFN: { rotate: [0, -28, -28, 0], transition: { duration: 0.95, ease: "easeInOut" } },
    sFN: { rotate: [0, 14, -10, 0], transition: { duration: 0.95, ease: "easeInOut" } },
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
  transform_pitch_fwd: { body: { rotate: 10, transition: hold(0.5) } },
  transform_pitch_back: { body: { rotate: -10, transition: hold(0.5) } },
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
      <motion.g animate={rig[thighKey]} style={{ transformOrigin: `${hip.x}px ${hip.y}px` }} opacity={alpha}>
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

        <motion.g animate={rig[shinKey]} style={{ transformOrigin: `${knee.x}px ${knee.y}px` }}>
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

        <motion.g animate={rig.body} style={{ transformOrigin: "126px 86px" }}>
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
          <motion.g animate={{ rotate: [0, 9, -6, 0], transition: { duration: 1.8, repeat: Infinity, ease: "easeInOut" } }} style={{ transformOrigin: "190px 76px" }}>
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
          <motion.g animate={rig.head} style={{ transformOrigin: "55px 73px" }}>
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
