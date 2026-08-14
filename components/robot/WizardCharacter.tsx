"use client";

import { motion, type Variants } from "framer-motion";
import type { RobotEmotion, RobotState } from "@/types";

interface WizardCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
}

const bodyVariants: Variants = {
  idle: { y: [0, -4, 0], transition: { duration: 2.2, repeat: Infinity, ease: "easeInOut" } },
  talking: { y: [0, -2, 0], transition: { duration: 0.55, repeat: Infinity } },
  walking: { y: [0, -4, 0, -4, 0], rotate: [0, 1, 0, -1, 0], transition: { duration: 0.65, repeat: Infinity } },
  jumping: { y: [0, -52, -48, 0], scaleY: [1, 1.08, 1.08, 0.92, 1], transition: { duration: 0.62, ease: "easeOut" } },
  headShake: { x: [0, -10, 10, -10, 10, 0], transition: { duration: 0.55 } },
  celebrating: { y: [0, -14, -6, -14, 0], rotate: [0, -6, 6, -6, 0], transition: { duration: 0.8, repeat: 3 } },
  error: { x: [0, -7, 7, -7, 7, 0], rotate: [0, -3, 3, 0], transition: { duration: 0.5 } },
  spinning: {},
  shaking: {},
};

const hatVariants: Variants = {
  idle: { rotate: [0, -2, 2, 0], transition: { duration: 3, repeat: Infinity } },
  talking: { rotate: [0, -5, 4, 0], transition: { duration: 0.5, repeat: Infinity } },
  walking: { rotate: [-4, 4, -4], transition: { duration: 0.65, repeat: Infinity } },
  jumping: { rotate: -10, y: -5 },
  headShake: { rotate: [0, -12, 12, -12, 0], transition: { duration: 0.55 } },
  celebrating: { rotate: [0, -12, 10, -12, 0], transition: { duration: 0.4, repeat: 5 } },
  error: { rotate: 14, y: 5 },
  spinning: {},
  shaking: {},
};

const wandVariants: Variants = {
  idle: { rotate: [0, 7, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, -35, 10, -35, 0], transition: { duration: 0.7, repeat: Infinity } },
  walking: { rotate: [-10, 12, -10], transition: { duration: 0.65, repeat: Infinity } },
  jumping: { rotate: -55 },
  headShake: {},
  celebrating: { rotate: [0, -75, -35, -75, 0], transition: { duration: 0.55, repeat: 4 } },
  error: { rotate: 35, y: 12 },
  spinning: {},
  shaking: {},
};

const sparkleVariants: Variants = {
  idle: { opacity: [0.35, 0.9, 0.35], scale: [0.75, 1.1, 0.75], transition: { duration: 1.8, repeat: Infinity } },
  talking: { opacity: [0.4, 1, 0.4], scale: [0.8, 1.25, 0.8], transition: { duration: 0.55, repeat: Infinity } },
  walking: { opacity: 0.45 },
  jumping: { opacity: 1, scale: 1.25 },
  headShake: { opacity: 0.3 },
  celebrating: { opacity: [0, 1, 0.4, 1, 0], scale: [0.4, 1.4, 0.8, 1.6, 0.3], transition: { duration: 0.8, repeat: 3 } },
  error: { opacity: 0.12, scale: 0.6 },
  spinning: {},
  shaking: {},
};

function Face({ emotion, error }: { emotion: RobotEmotion; error: boolean }) {
  const ink = error ? "#6B2448" : "#34294F";
  if (error) return <><path d="M72 98l11 7M83 98l-11 7M117 98l11 7M128 98l-11 7" stroke={ink} strokeWidth="3.4" strokeLinecap="round" /><path d="M91 122q9-9 18 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" /></>;
  const eyes = emotion === "happy"
    ? <><path d="M70 104q8-12 16 0M114 104q8-12 16 0" stroke={ink} strokeWidth="4" fill="none" strokeLinecap="round" /></>
    : emotion === "angry"
      ? <><circle cx="79" cy="104" r="5" fill={ink} /><circle cx="121" cy="104" r="5" fill={ink} /><path d="M69 94l18 7M131 94l-18 7" stroke={ink} strokeWidth="3" strokeLinecap="round" /></>
      : emotion === "surprised"
        ? <><circle cx="79" cy="103" r="7" fill={ink} /><circle cx="121" cy="103" r="7" fill={ink} /></>
        : <><ellipse cx="79" cy="104" rx="5" ry="6" fill={ink} /><ellipse cx="121" cy="104" rx="5" ry="6" fill={ink} /></>;
  const mouth = emotion === "sad"
    ? <path d="M92 122q8-8 16 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
    : emotion === "surprised"
      ? <circle cx="100" cy="119" r="5" stroke={ink} strokeWidth="2.5" fill="none" />
      : emotion === "angry"
        ? <path d="M92 118h16" stroke={ink} strokeWidth="3" strokeLinecap="round" />
        : <path d="M92 116q8 9 16 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />;
  return <>{eyes}{mouth}</>;
}

export default function WizardCharacter({ state, emotion = "idle", scale = 1, direction = "right", size = 184 }: WizardCharacterProps) {
  const error = state === "error";
  const h = Math.round(size * (226 / 184));
  const robe = error ? "#8D3C68" : emotion === "sad" ? "#7C7896" : emotion === "angry" ? "#B33A5B" : "#7152CC";
  const trim = error ? "#D17B9F" : emotion === "surprised" ? "#4EB7DA" : "#B8A1FF";

  return (
    <motion.div animate={state} variants={bodyVariants} style={{ width: size, height: h, display: "flex", alignItems: "flex-end", justifyContent: "center", scale, scaleX: (direction === "left" ? -1 : 1) * scale, transformOrigin: "bottom center" }}>
      <svg viewBox="0 0 200 250" width={size} height={h} preserveAspectRatio="xMidYMax meet" style={{ overflow: "visible" }} aria-hidden="true">
        <ellipse cx="100" cy="241" rx="45" ry="6" fill="#241D38" opacity=".18" />
        <motion.g animate={state} variants={sparkleVariants} style={{ transformOrigin: "156px 64px" }}>
          <path d="M156 48l3.5 10 10 3.5-10 3.5-3.5 10-3.5-10-10-3.5 10-3.5z" fill="#FFD866" />
          <circle cx="175" cy="85" r="4" fill="#67D8E8" />
          <circle cx="140" cy="91" r="3" fill="#F59ED5" />
        </motion.g>
        <path d="M67 145q33-24 66 0l24 88H43z" fill={robe} />
        <path d="M82 145l18 24 18-24 9 88H73z" fill={trim} opacity=".72" />
        <path d="M57 225h86" stroke="#E9DFFF" strokeWidth="5" strokeLinecap="round" opacity=".8" />
        <motion.g animate={state} variants={wandVariants} style={{ transformOrigin: "151px 157px", transformBox: "view-box" }}>
          <path d="M151 166L172 81" stroke="#6B452B" strokeWidth="7" strokeLinecap="round" />
          <path d="M172 68l4 9 10 1-8 7 2 10-8-5-9 5 2-10-7-7 10-1z" fill="#FFD866" stroke="#D99C36" strokeWidth="2" />
          <circle cx="151" cy="166" r="9" fill="#F8C9A8" />
        </motion.g>
        <motion.g animate={state} variants={hatVariants} style={{ transformOrigin: "100px 112px", transformBox: "view-box" }}>
          <circle cx="100" cy="108" r="42" fill="#FFD9BD" />
          <path d="M60 87q6-55 45-76 8 28 38 66z" fill={robe} />
          <path d="M105 11q7 29 36 65l-23-8z" fill="#49358F" opacity=".7" />
          <path d="M45 84q55-20 110 0-3 17-55 14T45 84z" fill={robe} stroke={trim} strokeWidth="4" />
          <path d="M80 77l4 8 9 1-7 6" fill="none" stroke="#FFD866" strokeWidth="3" strokeLinecap="round" />
          <Face emotion={emotion} error={error} />
          {!error && (emotion === "happy" || emotion === "idle") && <><ellipse cx="68" cy="114" rx="7" ry="4" fill="#F7A9AC" opacity=".7" /><ellipse cx="132" cy="114" rx="7" ry="4" fill="#F7A9AC" opacity=".7" /></>}
        </motion.g>
        <path d="M67 153q-18 20-18 45" stroke={robe} strokeWidth="18" strokeLinecap="round" />
        <circle cx="49" cy="199" r="9" fill="#FFD9BD" />
        <path d="M70 233h27" stroke="#49358F" strokeWidth="12" strokeLinecap="round" /><path d="M105 233h27" stroke="#49358F" strokeWidth="12" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
