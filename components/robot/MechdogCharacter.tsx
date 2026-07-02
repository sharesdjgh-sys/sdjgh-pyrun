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
  tFN: { rotate: [-16, 15, -16], transition: GAIT },
  sFN: { rotate: [12, -22, 12], transition: GAIT },
  tRF: { rotate: [-16, 15, -16], transition: GAIT },
  sRF: { rotate: [12, -22, 12], transition: GAIT },
  tFF: { rotate: [15, -16, 15], transition: GAIT },
  sFF: { rotate: [-22, 12, -22], transition: GAIT },
  tRN: { rotate: [15, -16, 15], transition: GAIT },
  sRN: { rotate: [-22, 12, -22], transition: GAIT },
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
    body: { rotate: -16, y: 6, transition: hold(0.6) },
    head: { rotate: -6, transition: hold(0.6) },
    tRN: { rotate: -58, transition: hold(0.6) },
    sRN: { rotate: 70, transition: hold(0.6) },
    tRF: { rotate: -58, transition: hold(0.6) },
    sRF: { rotate: 70, transition: hold(0.6) },
    tFN: { rotate: 12, transition: hold(0.6) },
    sFN: { rotate: -12, transition: hold(0.6) },
    tFF: { rotate: 12, transition: hold(0.6) },
    sFF: { rotate: -12, transition: hold(0.6) },
  },

  // 엎드리기: 네 다리 모두 접고 몸통 낮추기
  go_prone: {
    body: { y: 17, transition: hold(0.6) },
    head: { rotate: 4, transition: hold(0.6) },
    tFN: { rotate: -45, transition: hold(0.6) },
    sFN: { rotate: 78, transition: hold(0.6) },
    tFF: { rotate: -45, transition: hold(0.6) },
    sFF: { rotate: 78, transition: hold(0.6) },
    tRN: { rotate: -45, transition: hold(0.6) },
    sRN: { rotate: 78, transition: hold(0.6) },
    tRF: { rotate: -45, transition: hold(0.6) },
    sRF: { rotate: 78, transition: hold(0.6) },
  },

  // 두 발로 서기: 몸통 세우고 앞다리 들기
  stand_two_legs: {
    body: { rotate: -55, x: -10, y: -10, transition: hold(0.8) },
    head: { rotate: 12, transition: hold(0.8) },
    tRN: { rotate: 46, transition: hold(0.8) },
    sRN: { rotate: -22, transition: hold(0.8) },
    tRF: { rotate: 46, transition: hold(0.8) },
    sRF: { rotate: -22, transition: hold(0.8) },
    tFN: { rotate: -28, transition: hold(0.8) },
    sFN: { rotate: 46, transition: hold(0.8) },
    tFF: { rotate: -28, transition: hold(0.8) },
    sFF: { rotate: 46, transition: hold(0.8) },
  },

  // 악수: 뒤로 살짝 앉고 앞쪽 다리를 들어 위아래로 흔들기
  handshake: {
    body: { rotate: -8, y: 3, transition: hold(0.4) },
    tRN: { rotate: -25, transition: hold(0.4) },
    sRN: { rotate: 35, transition: hold(0.4) },
    tRF: { rotate: -25, transition: hold(0.4) },
    sRF: { rotate: 35, transition: hold(0.4) },
    tFF: { rotate: 10, transition: hold(0.4) },
    tFN: { rotate: [0, 42, 42, 42, 42, 36], transition: { duration: 1.4, ease: "easeInOut" } },
    sFN: { rotate: [0, -18, 14, -18, 14, -4], transition: { duration: 1.4, ease: "easeInOut" } },
  },

  // 인사(절): 앞다리 굽히고 앞으로 숙이기
  scrape_a_bow: {
    body: { rotate: 13, y: 4, transition: hold(0.55) },
    head: { rotate: [0, 14, 14, 0], transition: { duration: 1.1 } },
    tFN: { rotate: 22, transition: hold(0.55) },
    sFN: { rotate: 55, transition: hold(0.55) },
    tFF: { rotate: 22, transition: hold(0.55) },
    sFF: { rotate: 55, transition: hold(0.55) },
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
    body: { rotate: -13, y: 5, transition: hold(0.4) },
    tRN: { rotate: -32, transition: hold(0.4) },
    sRN: { rotate: 42, transition: hold(0.4) },
    tRF: { rotate: -32, transition: hold(0.4) },
    sRF: { rotate: 42, transition: hold(0.4) },
    tFN: { rotate: [0, -45, -78, -45, -78, -45], transition: BOX_T },
    sFN: { rotate: [0, 22, -12, 22, -12, 22], transition: BOX_T },
    tFF: { rotate: [0, -78, -45, -78, -45, -78], transition: BOX_T },
    sFF: { rotate: [0, -12, 22, -12, 22, -12], transition: BOX_T },
  },

  // 기지개: 앞다리 앞으로 뻗어 가슴 낮추고 엉덩이 들기
  stretch_oneself: {
    body: { rotate: 13, y: 2, transition: hold(0.6) },
    head: { rotate: -10, transition: hold(0.6) },
    tFN: { rotate: -45, transition: hold(0.6) },
    sFN: { rotate: -18, transition: hold(0.6) },
    tFF: { rotate: -45, transition: hold(0.6) },
    sFF: { rotate: -18, transition: hold(0.6) },
    tRN: { rotate: 6, transition: hold(0.6) },
    sRN: { rotate: -6, transition: hold(0.6) },
    tRF: { rotate: 6, transition: hold(0.6) },
    sRF: { rotate: -6, transition: hold(0.6) },
  },

  // 쉬: 뒷다리 한쪽 들기
  pee: {
    body: { rotate: 2, transition: hold(0.5) },
    head: { rotate: -4, transition: hold(0.5) },
    tRN: { rotate: -55, transition: hold(0.5) },
    sRN: { rotate: 48, transition: hold(0.5) },
  },

  // 팔굽혀펴기: 몸통이 두 번 내려갔다 올라오고 다리가 함께 굽혀짐
  press_up: {
    body: { y: [0, 15, 2, 15, 0], transition: PRESS_UP_T },
    tFN: { rotate: [0, -20, -2, -20, 0], transition: PRESS_UP_T },
    sFN: { rotate: [0, 44, 4, 44, 0], transition: PRESS_UP_T },
    tFF: { rotate: [0, -20, -2, -20, 0], transition: PRESS_UP_T },
    sFF: { rotate: [0, 44, 4, 44, 0], transition: PRESS_UP_T },
    tRN: { rotate: [0, -20, -2, -20, 0], transition: PRESS_UP_T },
    sRN: { rotate: [0, 44, 4, 44, 0], transition: PRESS_UP_T },
    tRF: { rotate: [0, -20, -2, -20, 0], transition: PRESS_UP_T },
    sRF: { rotate: [0, 44, 4, 44, 0], transition: PRESS_UP_T },
  },

  rotation_pitch: {
    body: { rotate: [0, 9, -9, 9, -9, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },
  rotation_roll: {
    body: { skewY: [0, 6, -6, 6, -6, 0], transition: { duration: 1.15, ease: "easeInOut" } },
  },

  left_foot_kick: {
    body: { rotate: -4, transition: hold(0.3) },
    tFF: { rotate: [0, -72, -72, 0], transition: { duration: 0.95, ease: "easeInOut" } },
    sFF: { rotate: [0, 28, -14, 0], transition: { duration: 0.95, ease: "easeInOut" } },
  },
  right_foot_kick: {
    body: { rotate: -4, transition: hold(0.3) },
    tFN: { rotate: [0, -72, -72, 0], transition: { duration: 0.95, ease: "easeInOut" } },
    sFN: { rotate: [0, 28, -14, 0], transition: { duration: 0.95, ease: "easeInOut" } },
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

const YELLOW = "#F4AC22";
const YELLOW_LIGHT = "#FFE07B";
const YELLOW_DARK = "#B97008";
const YELLOW_SIDE = "#D98913";
const BLACK = "#15181D";
const BLACK_SOFT = "#2B3037";
const STEEL = "#D7DEE6";
const STEEL_DARK = "#69727D";
const BOLT = "#1D2229";

type Pt = { x: number; y: number };

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

  const sensorColor = isError ? "#EF4444" : ledColor ?? "#68717D";
  const eyeFill = ledColor ? ledColor : isError ? "#EF4444" : "#323A45";

  const renderLeg = (hip: Pt, knee: Pt, foot: Pt, thighKey: PartKey, shinKey: PartKey, far = false) => {
    const sideYellow = far ? "#C97912" : YELLOW;
    const sideBlack = far ? "#0F1216" : BLACK;
    const alpha = far ? 0.76 : 1;

    return (
      <motion.g animate={rig[thighKey]} style={{ transformOrigin: `${hip.x}px ${hip.y}px` }} opacity={alpha}>
        <path
          d={`M ${hip.x - 8} ${hip.y - 5} L ${hip.x + 10} ${hip.y - 2} L ${knee.x + 8} ${knee.y + 3} L ${knee.x - 7} ${knee.y + 8} Z`}
          fill={sideYellow}
          stroke={YELLOW_DARK}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <line x1={hip.x + 11} y1={hip.y + 2} x2={knee.x + 13} y2={knee.y + 3} stroke={STEEL} strokeWidth="3.2" strokeLinecap="round" />
        <circle cx={hip.x} cy={hip.y} r="6.3" fill={BLACK_SOFT} />
        <circle cx={hip.x} cy={hip.y} r="2.4" fill={STEEL} />

        <motion.g animate={rig[shinKey]} style={{ transformOrigin: `${knee.x}px ${knee.y}px` }}>
          <path
            d={`M ${knee.x - 3} ${knee.y + 3} C ${knee.x - 6} ${knee.y + 20}, ${foot.x - 19} ${foot.y - 18}, ${foot.x - 3} ${foot.y}`}
            fill="none"
            stroke={sideBlack}
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line x1={knee.x + 7} y1={knee.y + 2} x2={foot.x + 7} y2={foot.y - 10} stroke={STEEL_DARK} strokeWidth="2.8" strokeLinecap="round" />
          <ellipse cx={foot.x + 2} cy={foot.y + 2} rx="13" ry="6" fill={sideBlack} transform={`rotate(-18 ${foot.x + 2} ${foot.y + 2})`} />
          <ellipse cx={foot.x + 5} cy={foot.y - 1} rx="5" ry="2" fill="#3B414A" opacity="0.75" transform={`rotate(-18 ${foot.x + 5} ${foot.y - 1})`} />
          <circle cx={knee.x} cy={knee.y} r="5.3" fill={BLACK_SOFT} />
          <circle cx={knee.x} cy={knee.y} r="2" fill={STEEL} />
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
          {renderLeg({ x: 86, y: 91 }, { x: 76, y: 116 }, { x: 95, y: 146 }, "tFF", "sFF", true)}
          {renderLeg({ x: 160, y: 90 }, { x: 151, y: 115 }, { x: 172, y: 145 }, "tRF", "sRF", true)}

          {/* rear shoulder motor */}
          <path d="M174 60 L205 69 L198 101 L169 94 Z" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="190" cy="84" r="9" fill={YELLOW} stroke={YELLOW_DARK} strokeWidth="2" />
          <circle cx="190" cy="84" r="3.4" fill={BLACK_SOFT} />

          {/* main low side chassis */}
          <path
            d="M55 58 Q63 49 77 44 H163 Q180 47 190 59 L181 99 H68 Q55 96 46 83 Z"
            fill={YELLOW}
            stroke={YELLOW_DARK}
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          <path d="M76 44 H164 L191 58 H61 Z" fill={YELLOW_LIGHT} opacity="0.7" />
          <path d="M64 63 H183 L178 76 H56 Z" fill="#FFC64A" opacity="0.55" />

          {/* top perforated armor plate */}
          <path d="M66 35 H147 L179 48 L164 59 H49 Z" fill="#F6B932" stroke={YELLOW_DARK} strokeWidth="1.8" strokeLinejoin="round" />
          {[76, 89, 102, 115, 128, 142, 155].map((x, i) => (
            <rect key={`slot-${x}`} x={x} y={i > 4 ? 48 : 42} width="8" height="3.2" rx="1.6" fill="#8F5709" opacity="0.82" />
          ))}
          {[72, 95, 118, 141].map((x) => (
            <circle key={`hole-${x}`} cx={x} cy="51.5" r="2.3" fill="#8F5709" opacity="0.82" />
          ))}
          <path d="M124 36 H157 L170 45 H133 Z" fill="#FFE08A" opacity="0.55" />
          <path d="M132 33 L167 42 L159 47 L123 38 Z" fill="#D88C16" opacity="0.86" />

          {/* side triangular truss and name plate */}
          <path d="M78 67 L96 92 H61 Z M105 67 L121 92 H88 Z M138 67 L155 92 H121 Z" fill="none" stroke="#603A08" strokeWidth="3.4" strokeLinejoin="round" opacity="0.78" />
          <rect x="111" y="61" width="49" height="13" rx="2" fill="#2E333B" />
          <rect x="116" y="64" width="37" height="3" rx="1.5" fill="#95A0AB" opacity="0.78" />
          <text x="134" y="72" textAnchor="middle" fontSize="5.5" fontWeight="800" fill="#D7DEE6">K-09</text>
          <path d="M64 98 H181" stroke={YELLOW_DARK} strokeWidth="7" strokeLinecap="round" />

          {[65, 83, 171, 181, 70, 101, 163].map((x, i) => (
            <circle key={`bolt-${i}`} cx={x} cy={i < 4 ? 62 : 92} r="2.2" fill={BOLT} />
          ))}

          {/* front shoulder block */}
          <path d="M54 61 L82 70 L76 101 Q61 101 45 90 Z" fill={YELLOW_SIDE} stroke={YELLOW_DARK} strokeWidth="2" strokeLinejoin="round" />
          <circle cx="67" cy="84" r="9" fill={YELLOW} stroke={YELLOW_DARK} strokeWidth="2" />
          <circle cx="67" cy="84" r="3.3" fill={BLACK_SOFT} />

          {renderLeg({ x: 78, y: 93 }, { x: 68, y: 119 }, { x: 89, y: 151 }, "tFN", "sFN", false)}
          {renderLeg({ x: 164, y: 92 }, { x: 153, y: 119 }, { x: 174, y: 151 }, "tRN", "sRN", false)}

          {/* front sensor head */}
          <motion.g animate={rig.head} style={{ transformOrigin: "55px 73px" }}>
            <path d="M23 56 Q34 44 51 42 H77 Q89 45 94 57 L88 90 Q80 97 37 94 Q25 90 19 78 Z" fill={YELLOW} stroke={YELLOW_DARK} strokeWidth="2.4" strokeLinejoin="round" />
            <path d="M51 42 H77 Q88 46 94 57 H28 Q36 48 51 42 Z" fill={YELLOW_LIGHT} opacity="0.76" />
            <path d="M27 61 Q55 57 86 61 L83 88 Q57 92 32 88 Z" fill="#111418" opacity="0.88" />
            <circle cx="34" cy="86" r="3.2" fill="#F8C24C" opacity="0.95" />
            <circle cx="80" cy="86" r="3.2" fill="#F8C24C" opacity="0.95" />
            <g style={ledColor || isError ? { filter: `drop-shadow(0 0 7px ${sensorColor})` } : undefined}>
              <circle cx="47" cy="73" r="13.5" fill="#0D1014" stroke={sensorColor} strokeWidth="3" />
              <circle cx="47" cy="73" r="8.5" fill={eyeFill} />
              <circle cx="43" cy="68.5" r="3" fill="#F8FBFF" opacity="0.98" />
              <circle cx="50.5" cy="77.5" r="1.7" fill="#8D99A6" opacity="0.8" />
              <circle cx="72" cy="73" r="13.5" fill="#0D1014" stroke={sensorColor} strokeWidth="3" />
              <circle cx="72" cy="73" r="8.5" fill={eyeFill} />
              <circle cx="68" cy="68.5" r="3" fill="#F8FBFF" opacity="0.98" />
              <circle cx="75.5" cy="77.5" r="1.7" fill="#8D99A6" opacity="0.8" />
            </g>
            <path d="M51 90 Q60 96 70 90" fill="none" stroke="#744607" strokeWidth="2.5" strokeLinecap="round" opacity="0.95" />
            <path d="M36 60 Q47 55 58 59" fill="none" stroke="#FFE9A8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <rect x="30" y="50" width="28" height="4" rx="2" fill="#8F5709" opacity="0.72" />
            <circle cx="84" cy="62" r="2.2" fill={BOLT} />
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
