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
    body: { y: [0, -1.5, 0], transition: { duration: 2.4, repeat: Infinity, ease: "easeInOut" } },
    head: { rotate: [0, 2, 0, -2, 0], transition: { duration: 4, repeat: Infinity, ease: "easeInOut" } },
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
    tFN: { rotate: [0, -60, -60, -60, -60, -55], transition: { duration: 1.4, ease: "easeInOut" } },
    sFN: { rotate: [0, -15, 15, -15, 15, 0], transition: { duration: 1.4, ease: "easeInOut" } },
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

// 실물 색상 팔레트 (노란 알루미늄 섀시 + 검은 다리)
const AMBER = "#EFA22B";
const AMBER_DARK = "#C97F16";
const AMBER_TOP = "#F3AD3E";
const AMBER_FAR = "#C9821A";
const LEG_DARK = "#23272E";
const LEG_DARK_FAR = "#15181D";
const STEEL = "#2E333B";
const PIN = "#9AA3AE";

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
  const w = Math.round(size * 1.6);
  const h = Math.round(w * (170 / 240));
  const directionScaleX = direction === "left" ? -1 : 1;

  // 액션이 최우선, 없으면 상태(걷기/점프 등) 리그 사용
  const override: Rig = (action ? ACTIONS[action] ?? FALLBACK_ACTION : undefined) ?? STATE_RIGS[state] ?? {};
  const rig = {} as Record<PartKey, TargetAndTransition>;
  for (const k of PART_KEYS) rig[k] = override[k] ?? NEUTRAL[k];

  const lensRing = isError ? "#EF4444" : ledColor ?? "#4A525C";
  const lensGlow = isError ? "#EF4444" : ledColor;

  // 다리: hip(엉덩이 관절) → knee(무릎 관절) → foot, 2단 중첩 회전 그룹
  const renderLeg = (hip: Pt, knee: Pt, foot: Pt, thighKey: PartKey, shinKey: PartKey, far: boolean) => {
    const thighColor = far ? AMBER_FAR : AMBER;
    const shinColor = far ? LEG_DARK_FAR : LEG_DARK;
    return (
      <motion.g animate={rig[thighKey]} style={{ transformOrigin: `${hip.x}px ${hip.y}px` }}>
        {/* 허벅지 (알루미늄) + 평행 링크 막대 */}
        <line x1={hip.x} y1={hip.y} x2={knee.x} y2={knee.y} stroke={thighColor} strokeWidth={13} strokeLinecap="round" />
        <line x1={hip.x + 6} y1={hip.y + 3} x2={knee.x + 6} y2={knee.y - 2} stroke={STEEL} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={hip.x} cy={hip.y} r={4.2} fill={STEEL} />
        <circle cx={hip.x} cy={hip.y} r={1.6} fill={PIN} />
        <motion.g animate={rig[shinKey]} style={{ transformOrigin: `${knee.x}px ${knee.y}px` }}>
          {/* 정강이 (검은색) + 고무 발 */}
          <line x1={knee.x} y1={knee.y} x2={foot.x} y2={foot.y} stroke={shinColor} strokeWidth={7} strokeLinecap="round" />
          <ellipse cx={foot.x + 2} cy={foot.y} rx={6} ry={3.5} fill={shinColor} />
          <circle cx={knee.x} cy={knee.y} r={3.6} fill={STEEL} />
          <circle cx={knee.x} cy={knee.y} r={1.4} fill={PIN} />
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
        viewBox="0 0 240 170"
        width={w}
        height={h}
        preserveAspectRatio="xMidYMax meet"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 그림자 */}
        <ellipse cx="122" cy="153" rx="74" ry="7" fill="#58483B" opacity="0.14" />

        <motion.g animate={rig.body} style={{ transformOrigin: "120px 92px" }}>
          {/* 먼 쪽 다리 (몸통 뒤) */}
          {renderLeg({ x: 167, y: 88 }, { x: 154, y: 112 }, { x: 164, y: 143 }, "tFF", "sFF", true)}
          {renderLeg({ x: 89, y: 88 }, { x: 76, y: 112 }, { x: 86, y: 143 }, "tRF", "sRF", true)}

          {/* 몸통 섀시 */}
          <rect x="52" y="58" width="10" height="30" rx="3" fill={AMBER_DARK} />
          <rect x="58" y="54" width="128" height="42" rx="9" fill={AMBER} stroke={AMBER_DARK} strokeWidth="2" />
          {/* 상판 (타공 플레이트) */}
          <rect x="50" y="45" width="144" height="13" rx="4" fill={AMBER_TOP} stroke={AMBER_DARK} strokeWidth="1.5" />
          {[60, 72, 84, 96, 108, 120, 132, 144, 156, 168, 180].map((x) => (
            <circle key={x} cx={x} cy={51.5} r={1.8} fill="#B06F12" />
          ))}
          {/* 측면 삼각 트러스 디테일 */}
          <path d="M 78 64 L 92 88 L 64 88 Z" fill="none" stroke={AMBER_DARK} strokeWidth="2.5" strokeLinejoin="round" />
          {/* ESP32 보드 */}
          <rect x="100" y="62" width="44" height="24" rx="3" fill="#2F3540" />
          <rect x="112" y="67" width="14" height="12" rx="2" fill="#454D5A" />
          <rect x="130" y="67" width="8" height="6" rx="1" fill="#454D5A" />
          {[104, 108.5, 113, 117.5, 122, 126.5, 131, 135.5, 140].map((x) => (
            <circle key={x} cx={x} cy={82.5} r={1} fill={PIN} />
          ))}
          {/* 볼트 디테일 */}
          <circle cx="63" cy="60" r="1.6" fill="#B06F12" />
          <circle cx="180" cy="60" r="1.6" fill="#B06F12" />
          <circle cx="63" cy="90" r="1.6" fill="#B06F12" />
          <circle cx="152" cy="90" r="1.6" fill="#B06F12" />
          {/* 하부 프레임 */}
          <rect x="62" y="92" width="120" height="6" rx="3" fill={AMBER_DARK} />

          {/* 앞쪽(near) 다리 (몸통 앞) */}
          {renderLeg({ x: 160, y: 90 }, { x: 147, y: 116 }, { x: 157, y: 148 }, "tFN", "sFN", false)}
          {renderLeg({ x: 82, y: 90 }, { x: 69, y: 116 }, { x: 79, y: 148 }, "tRN", "sRN", false)}

          {/* 헤드: 초음파 센서 (RGB LED 내장 렌즈 2개) */}
          <motion.g animate={rig.head} style={{ transformOrigin: "188px 74px" }}>
            <rect x="178" y="64" width="12" height="24" rx="3" fill={AMBER_DARK} />
            <rect x="184" y="55" width="34" height="34" rx="8" fill="#E8A128" stroke="#B06F12" strokeWidth="2" />
            {/* 상태 LED */}
            <circle cx="190" cy="60" r="2" fill={lensGlow ?? "#6B7280"} />
            {/* 렌즈 (LED 색으로 발광) */}
            <g style={lensGlow ? { filter: `drop-shadow(0 0 6px ${lensGlow})` } : undefined}>
              <circle cx="195" cy="72" r="8" fill="#14171B" stroke={lensRing} strokeWidth="2.5" />
              <circle cx="195" cy="72" r="4.2" fill="#2F3843" />
              <circle cx="193" cy="70" r="1.5" fill="#C9D2DB" />
              <circle cx="208" cy="72" r="9" fill="#14171B" stroke={lensRing} strokeWidth="2.5" />
              <circle cx="208" cy="72" r="4.8" fill="#2F3843" />
              <circle cx="205.5" cy="69.5" r="1.7" fill="#C9D2DB" />
            </g>
            {/* 통풍구 */}
            <line x1="188" y1="84" x2="196" y2="84" stroke="#B06F12" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="200" y1="84" x2="208" y2="84" stroke="#B06F12" strokeWidth="1.5" strokeLinecap="round" />
          </motion.g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
