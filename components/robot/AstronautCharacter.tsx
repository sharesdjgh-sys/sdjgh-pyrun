"use client";

import { motion, type Variants } from "framer-motion";
import type { RobotEmotion, RobotState } from "@/types";

interface AstronautCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
}

const bodyVariants: Variants = {
  idle: { y: [0, -6, 0], rotate: [0, 1.5, 0, -1.5, 0], transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } },
  talking: { y: [0, -3, 0], transition: { duration: 0.65, repeat: Infinity } },
  walking: { y: [0, -6, 0, -6, 0], transition: { duration: 0.85, repeat: Infinity, ease: "easeInOut" } },
  jumping: { y: [0, -58, -58, 0], rotate: [0, -5, 5, 0], transition: { duration: 0.72, ease: "easeOut" } },
  headShake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.55 } },
  celebrating: { y: [0, -18, -9, -20, 0], rotate: [0, 7, -7, 7, 0], transition: { duration: 0.9, repeat: 3 } },
  error: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.5 } },
  spinning: {},
  shaking: {},
};

const armLeftVariants: Variants = {
  idle: { rotate: [0, 5, 0], transition: { duration: 2.2, repeat: Infinity } },
  talking: { rotate: [0, -35, -10, -35, 0], transition: { duration: 0.7, repeat: Infinity } },
  walking: { rotate: [-22, 22, -22], transition: { duration: 0.85, repeat: Infinity } },
  jumping: { rotate: -55 }, headShake: {},
  celebrating: { rotate: [0, -90, -55, -90, 0], transition: { duration: 0.6, repeat: 4 } },
  error: { rotate: 18 }, spinning: {}, shaking: {},
};
const armRightVariants: Variants = {
  idle: { rotate: [0, -5, 0], transition: { duration: 2.2, repeat: Infinity } },
  talking: { rotate: [0, 20, 0], transition: { duration: 0.7, repeat: Infinity } },
  walking: { rotate: [22, -22, 22], transition: { duration: 0.85, repeat: Infinity } },
  jumping: { rotate: 55 }, headShake: {},
  celebrating: { rotate: [0, 90, 55, 90, 0], transition: { duration: 0.6, repeat: 4 } },
  error: { rotate: -18 }, spinning: {}, shaking: {},
};
const legLeftVariants: Variants = { walking: { rotate: [-18, 20, -18], transition: { duration: 0.85, repeat: Infinity } }, jumping: { rotate: -14 }, celebrating: { rotate: [0, -12, 0], transition: { duration: 0.5, repeat: 4 } } };
const legRightVariants: Variants = { walking: { rotate: [18, -20, 18], transition: { duration: 0.85, repeat: Infinity } }, jumping: { rotate: 14 }, celebrating: { rotate: [0, 12, 0], transition: { duration: 0.5, repeat: 4 } } };
const flameVariants: Variants = {
  idle: { opacity: 0 }, talking: { opacity: 0 }, walking: { opacity: 0 }, headShake: { opacity: 0 }, error: { opacity: 0 }, spinning: { opacity: 0 }, shaking: { opacity: 0 },
  jumping: { opacity: [0, 1, .5, 0], scaleY: [0.3, 1.3, .8, 0.2], transition: { duration: .7 } },
  celebrating: { opacity: [0, 1, .55, 1, 0], scaleY: [.2, 1.5, .8, 1.4, .2], transition: { duration: .9, repeat: 3 } },
};

function Face({ emotion, error }: { emotion: RobotEmotion; error: boolean }) {
  const ink = error ? "#7F1D1D" : "#17324D";
  if (error) return <><path d="M72 89l11 7M83 89l-11 7M117 89l11 7M128 89l-11 7" stroke={ink} strokeWidth="3.5" strokeLinecap="round" /><path d="M92 113q8-8 16 0" stroke={ink} strokeWidth="3" fill="none" /></>;
  const eyes = emotion === "happy"
    ? <><path d="M70 96q8-11 16 0M114 96q8-11 16 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" /></>
    : emotion === "angry"
      ? <><circle cx="79" cy="96" r="5" fill={ink} /><circle cx="121" cy="96" r="5" fill={ink} /><path d="M69 86l18 7M131 86l-18 7" stroke={ink} strokeWidth="3" /></>
      : emotion === "surprised"
        ? <><circle cx="79" cy="96" r="7" fill={ink} /><circle cx="121" cy="96" r="7" fill={ink} /></>
        : <><ellipse cx="79" cy="96" rx="5" ry="6" fill={ink} /><ellipse cx="121" cy="96" rx="5" ry="6" fill={ink} /></>;
  const mouth = emotion === "sad" ? <path d="M92 114q8-8 16 0" stroke={ink} strokeWidth="3" fill="none" /> : emotion === "surprised" ? <circle cx="100" cy="110" r="5" stroke={ink} strokeWidth="2.5" fill="none" /> : emotion === "angry" ? <path d="M92 110h16" stroke={ink} strokeWidth="3" /> : <path d="M92 108q8 8 16 0" stroke={ink} strokeWidth="3" fill="none" />;
  return <>{eyes}{mouth}</>;
}

export default function AstronautCharacter({ state, emotion = "idle", scale = 1, direction = "right", size = 184 }: AstronautCharacterProps) {
  const error = state === "error";
  const h = Math.round(size * (226 / 184));
  const accent = error ? "#E25B5B" : emotion === "angry" ? "#E26745" : emotion === "sad" ? "#8A94A6" : "#24A8C7";
  const glass = error ? "#F9B5B5" : emotion === "surprised" ? "#BCEFFF" : "#BCE8F2";
  return (
    <motion.div animate={state} variants={bodyVariants} style={{ width: size, height: h, display: "flex", alignItems: "flex-end", justifyContent: "center", scale, scaleX: (direction === "left" ? -1 : 1) * scale, transformOrigin: "bottom center" }}>
      <svg viewBox="0 0 200 250" width={size} height={h} preserveAspectRatio="xMidYMax meet" style={{ overflow: "visible" }} aria-hidden="true">
        <ellipse cx="100" cy="242" rx="44" ry="6" fill="#17324D" opacity=".16" />
        <rect x="57" y="126" width="86" height="80" rx="26" fill="#E8EEF2" stroke="#C6D5DC" strokeWidth="3" />
        <rect x="48" y="137" width="18" height="54" rx="8" fill="#A5BCC6" />
        <motion.g animate={state} variants={flameVariants} style={{ transformOrigin: "52px 198px", transformBox: "view-box" }}>
          <path d="M44 188q8 28 16 0l-3 38-5 13-5-13z" fill="#FFB52E" /><path d="M49 193q3 20 6 0l-1 29-2 8-2-8z" fill="#FFF07A" />
        </motion.g>
        <motion.g animate={state} variants={legLeftVariants} style={{ transformOrigin: "84px 194px", transformBox: "view-box" }}><rect x="72" y="187" width="24" height="43" rx="9" fill="#EEF4F7" stroke="#C6D5DC" strokeWidth="2" /><rect x="65" y="222" width="34" height="17" rx="8" fill={accent} /></motion.g>
        <motion.g animate={state} variants={legRightVariants} style={{ transformOrigin: "116px 194px", transformBox: "view-box" }}><rect x="104" y="187" width="24" height="43" rx="9" fill="#EEF4F7" stroke="#C6D5DC" strokeWidth="2" /><rect x="101" y="222" width="34" height="17" rx="8" fill={accent} /></motion.g>
        <rect x="76" y="149" width="48" height="31" rx="8" fill="#FFFFFF" stroke="#C6D5DC" strokeWidth="2" /><circle cx="88" cy="160" r="4" fill="#57D6A1" /><circle cx="101" cy="160" r="4" fill="#FFCB57" /><rect x="84" y="170" width="32" height="4" rx="2" fill={accent} />
        <motion.g animate={state} variants={armLeftVariants} style={{ transformOrigin: "65px 151px", transformBox: "view-box" }}><rect x="43" y="143" width="25" height="58" rx="11" fill="#EEF4F7" stroke="#C6D5DC" strokeWidth="2" /><circle cx="54" cy="201" r="11" fill={accent} /></motion.g>
        <motion.g animate={state} variants={armRightVariants} style={{ transformOrigin: "135px 151px", transformBox: "view-box" }}><rect x="132" y="143" width="25" height="58" rx="11" fill="#EEF4F7" stroke="#C6D5DC" strokeWidth="2" /><circle cx="146" cy="201" r="11" fill={accent} /></motion.g>
        <g>
          <circle cx="100" cy="92" r="53" fill="#F8FBFC" stroke="#C6D5DC" strokeWidth="4" />
          <path d="M57 89q2-38 43-42 41 4 43 42v22H57z" fill={glass} stroke={accent} strokeWidth="4" />
          <path d="M70 64q22-18 51-7" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" opacity=".65" />
          <Face emotion={emotion} error={error} />
          <circle cx="145" cy="112" r="8" fill={accent} /><path d="M145 108v8M141 112h8" stroke="#fff" strokeWidth="2" />
        </g>
        <path d="M82 135h36" stroke={accent} strokeWidth="6" strokeLinecap="round" />
        <path d="M93 35l7-15 7 15" fill="none" stroke={accent} strokeWidth="3" strokeLinecap="round" /><circle cx="100" cy="18" r="5" fill="#FFCB57" />
      </svg>
    </motion.div>
  );
}
