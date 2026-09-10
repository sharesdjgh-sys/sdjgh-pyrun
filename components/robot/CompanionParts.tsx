"use client";

import { useId, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { CharacterLoadout, RobotEmotion, RobotState } from "@/types";

export interface CompanionProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
  loadout?: CharacterLoadout;
}

const rest = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
export const companionMotion: Variants = {
  idle: { ...rest, y: [0, -2.5, 0], transition: { duration: 2.8, repeat: Infinity, ease: "easeInOut" } },
  talking: { ...rest, y: [0, -3, 0], rotate: [0, -1.5, 1.5, 0], transition: { duration: .8, repeat: Infinity } },
  walking: { ...rest, y: [0, -5, 0], rotate: [-2, 2, -2], transition: { duration: .5, repeat: Infinity } },
  jumping: { ...rest, y: [0, 3, -36, -36, 0], scaleY: [1, .95, 1.04, 1.04, 1], transition: { duration: .7 } },
  celebrating: { ...rest, y: [0, -10, 0, -14, 0], rotate: [0, -5, 5, -5, 0], transition: { duration: 1.1, repeat: 2 } },
  error: { ...rest, x: [0, -4, 4, -3, 3, 0], transition: { duration: .5 } },
  headShake: { ...rest, rotate: [0, -6, 6, -6, 0], transition: { duration: .6 } },
  shaking: { ...rest, x: [0, -6, 6, -6, 0], transition: { duration: .5 } },
  spinning: { ...rest, rotate: [0, 360], transition: { duration: .75 } },
};

export function CompanionFrame({ state, scale = 1, direction = "right", size = 184, children, label }: CompanionProps & { children: ReactNode; label: string }) {
  const reduced = useReducedMotion();
  const h = Math.round(size * 226 / 184);
  return <div data-companion={label} style={{ width: size, height: h, flexShrink: 0, transform: `scale(${scale}) scaleX(${direction === "left" ? -1 : 1})`, transformOrigin: "bottom center" }}>
    <svg viewBox="0 0 200 250" width={size} height={h} preserveAspectRatio="xMidYMax meet" style={{ overflow: "visible" }} aria-hidden="true">
      <ellipse cx="100" cy="239" rx="46" ry="6" fill="#50416E" opacity=".11" />
      <motion.g animate={reduced ? "still" : state} variants={{ ...companionMotion, still: rest }} style={{ transformOrigin: "100px 232px" }}>{children}</motion.g>
    </svg>
  </div>;
}

// Picker, wardrobe and stage clones must each own their paint server IDs.
export function useCompanionPaint() {
  const id = useId().replace(/:/g, "");
  return { id: (name: string) => `${id}-${name}`, fill: (name: string) => `url(#${id}-${name})` };
}

export function CompanionFace({ emotion = "idle", error = false, iris = "#A36459", y = 104 }: { emotion?: RobotEmotion; error?: boolean; iris?: string; y?: number }) {
  const worried = error || emotion === "sad";
  return <g transform={`translate(0 ${y - 104})`}>
    <ellipse cx="55" cy="123" rx="11" ry="6.5" fill="#F6A3AB" opacity=".6" />
    <ellipse cx="145" cy="123" rx="11" ry="6.5" fill="#F6A3AB" opacity=".6" />
    {[77, 123].map((x) => <g key={x}>
      <ellipse cx={x} cy="104" rx={emotion === "surprised" ? 14 : 12} ry={worried ? 12 : 16} fill="#352D49" />
      <ellipse cx={x + 1} cy="111" rx="8" ry="8" fill={iris} />
      <ellipse cx={x - 3.5} cy="97.5" rx="4.8" ry="5.5" fill="white" />
      <circle cx={x + 5} cy="109" r="2.6" fill="#FFFBEF" />
      <path d={`M${x - 11} 92q10-7 19 0`} fill="none" stroke="#352D49" strokeWidth="2.5" strokeLinecap="round" />
    </g>)}
    {emotion === "angry" && <path d="M63 82l22 6m52-6-22 6" stroke="#6E5365" strokeWidth="3.5" strokeLinecap="round" />}
    {worried && <path d="M64 85q8 1 17-6m55 6q-8 1-17-6" fill="none" stroke="#9D7D86" strokeWidth="3" strokeLinecap="round" />}
    {worried ? <path d="M93 132q7-7 14 0" fill="none" stroke="#6E5365" strokeWidth="2.8" strokeLinecap="round" />
      : emotion === "surprised" ? <ellipse cx="100" cy="131" rx="5" ry="6" fill="#6E5365" />
        : emotion === "happy" ? <g><path d="M90 126q10 4 20 0q-1 15-10 15t-10-15" fill="#704052" /><path d="M94 136q6-6 12 0q-6 7-12 0" fill="#F4A0AE" /></g>
          : <path d="M92 129q8 8 16 0" fill="none" stroke="#6E5365" strokeWidth="2.8" strokeLinecap="round" />}
    <ellipse cx="100" cy="119" rx="3" ry="1.6" fill="#E4A392" opacity=".6" />
    {error && <path d="M153 88q-8 11 0 13q8-2 0-13" fill="#86D7ED" stroke="#F2FCFF" strokeWidth="1.5" />}
  </g>;
}

export function CompanionStar({ x, y, size = 9, fill = "#FFE8A5" }: { x: number; y: number; size?: number; fill?: string }) {
  return <path transform={`translate(${x} ${y}) scale(${size / 10})`} d="M0-10 3-3 10 0 3 3 0 10-3 3-10 0-3-3Z" fill={fill} stroke="#FFF7DA" strokeWidth="1" strokeLinejoin="round" />;
}
