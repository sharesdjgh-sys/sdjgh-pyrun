"use client";

import { motion, type Variants } from "framer-motion";
import { useId } from "react";
import type { CharacterLoadout, RobotEmotion, RobotState } from "@/types";
import CharacterCosmetics from "./CharacterCosmetics";
import { withRestingPose } from "./poseTransitions";

interface SlimeCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
  loadout?: CharacterLoadout;
}

const neutralBody = { x: 0, y: 0, rotate: 0, scaleX: 1, scaleY: 1 };
const bodyVariants: Variants = {
  idle: { y: [0, -5, 0], scaleX: [1, 1.03, 1], scaleY: [1, .97, 1], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  talking: { scaleX: [1, 1.08, .96, 1], scaleY: [1, .94, 1.05, 1], transition: { duration: .5, repeat: Infinity } },
  walking: { y: [0, -12, 0, -12, 0], scaleX: [1, .9, 1.1, .9, 1], scaleY: [1, 1.1, .88, 1.1, 1], transition: { duration: .65, repeat: Infinity } },
  jumping: { y: [0, -64, -58, 0], scaleX: [1, .82, .84, 1.18, 1], scaleY: [1, 1.22, 1.18, .78, 1], transition: { duration: .68, ease: "easeOut" } },
  headShake: { x: [0, -13, 13, -13, 13, 0], scaleX: [1, 1.08, .92, 1.06, 1], transition: { duration: .55 } },
  celebrating: { y: [0, -20, -5, -22, 0], scaleX: [1, .82, 1.15, .84, 1], scaleY: [1, 1.2, .85, 1.18, 1], rotate: [0, -6, 6, -6, 0], transition: { duration: .8, repeat: 3 } },
  error: { y: [0, 7, 4], scaleX: [1, 1.18, 1.12], scaleY: [1, .72, .78], transition: { duration: .45 } },
  spinning: { ...neutralBody },
  shaking: { ...neutralBody },
};

// A new action must not inherit flattening or rotation from an interrupted one.
const settledBodyVariants: Variants = withRestingPose(bodyVariants, neutralBody);

const bubbleVariants: Variants = {
  idle: { opacity: [0, .7, 0], y: [5, -5, -14], transition: { duration: 2.2, repeat: Infinity } },
  talking: { opacity: [.2, .8, .2], scale: [.8, 1.15, .8], transition: { duration: .6, repeat: Infinity } },
  walking: { opacity: .3 }, jumping: { opacity: .8, y: -10 }, headShake: { opacity: .2 },
  celebrating: { opacity: [0, 1, .5, 1, 0], y: [8, -18, -8, -24, -30], scale: [.4, 1.3, .8, 1.5, .3], transition: { duration: .8, repeat: 3 } },
  error: { opacity: 0 }, spinning: {}, shaking: {},
};

function Face({ emotion, error }: { emotion: RobotEmotion; error: boolean }) {
  const ink = error ? "#245A55" : "#174E4A";
  if (error) return <><path d="M68 119l13 8M81 119l-13 8M119 119l13 8M132 119l-13 8" stroke={ink} strokeWidth="4" strokeLinecap="round" /><path d="M91 149q9-9 18 0" stroke={ink} strokeWidth="3.5" fill="none" /></>;
  const eyes = emotion === "happy"
    ? <><path d="M65 129q10-15 20 0M115 129q10-15 20 0" stroke={ink} strokeWidth="5" fill="none" strokeLinecap="round" /></>
    : emotion === "angry"
      ? <><circle cx="76" cy="127" r="7" fill={ink} /><circle cx="124" cy="127" r="7" fill={ink} /><path d="M64 113l23 9M136 113l-23 9" stroke={ink} strokeWidth="4" /></>
      : emotion === "surprised"
        ? <><circle cx="76" cy="127" r="10" fill={ink} /><circle cx="124" cy="127" r="10" fill={ink} /><circle cx="73" cy="123" r="3" fill="#fff" /><circle cx="121" cy="123" r="3" fill="#fff" /></>
        : <><ellipse cx="76" cy="127" rx="7" ry="9" fill={ink} /><ellipse cx="124" cy="127" rx="7" ry="9" fill={ink} /><circle cx="74" cy="124" r="2.5" fill="#F0FFF8" /><circle cx="122" cy="124" r="2.5" fill="#F0FFF8" /></>;
  const mouth = emotion === "sad" ? <path d="M89 151q11-11 22 0" stroke={ink} strokeWidth="4" fill="none" /> : emotion === "surprised" ? <ellipse cx="100" cy="149" rx="7" ry="9" fill={ink} /> : emotion === "angry" ? <path d="M89 147h22" stroke={ink} strokeWidth="4" /> : <path d="M88 144q12 13 24 0" stroke={ink} strokeWidth="4" fill="none" />;
  return <>{eyes}{emotion === "happy" ? <g><path d="M89 144q11 5 22 0q-1 17-11 17t-11-17" fill={ink} /><path d="M94 156q6-6 12 0q-6 6-12 0" fill="#EFA9BD" /></g> : mouth}</>;
}

export default function SlimeCharacter({ state, emotion = "idle", scale = 1, direction = "right", size = 184, loadout }: SlimeCharacterProps) {
  const error = state === "error";
  const h = Math.round(size * (226 / 184));
  const fill = error ? "#82B9AD" : emotion === "sad" ? "#91B8B6" : emotion === "angry" ? "#EE7D79" : emotion === "surprised" ? "#6BCBE3" : "#55D5B0";
  const edge = error ? "#4A8076" : emotion === "angry" ? "#BE5354" : "#169E83";
  const paintId = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${paintId}-${name})`;
  const shine = emotion === "angry" ? "#FFE2DF" : emotion === "sad" || error ? "#E0EFEB" : "#DFFFF1";
  return (
    <div data-character="slime" style={{ width: size, height: h, display: "flex", alignItems: "flex-end", justifyContent: "center", transform: `scaleX(${direction === "left" ? -1 : 1})`, transformOrigin: "bottom center" }}>
      <svg viewBox="0 0 200 250" width={size * scale} height={h * scale} preserveAspectRatio="xMidYMax meet" style={{ overflow: "visible", flexShrink: 0 }} aria-hidden="true">
        <defs>
          <radialGradient id={`${paintId}-jelly`} cx=".32" cy=".27" r=".85"><stop stopColor={shine} /><stop offset=".38" stopColor={fill} /><stop offset=".8" stopColor={fill} /><stop offset="1" stopColor={edge} /></radialGradient>
          <linearGradient id={`${paintId}-belly`} x2=".2" y2="1"><stop stopColor={shine} stopOpacity="0" /><stop offset=".55" stopColor={shine} stopOpacity=".35" /><stop offset="1" stopColor={shine} stopOpacity=".05" /></linearGradient>
          <radialGradient id={`${paintId}-bubble`} cx=".32" cy=".25" r=".8"><stop stopColor="#FFFFFF" stopOpacity=".9" /><stop offset=".35" stopColor={shine} stopOpacity=".6" /><stop offset="1" stopColor={fill} stopOpacity=".25" /></radialGradient>
        </defs>
        <ellipse cx="100" cy="231" rx="58" ry="9" fill="#174E4A" opacity=".15" />
        <motion.g animate={state} variants={bubbleVariants} style={{ transformOrigin: "100px 100px", transformBox: "view-box" }}>
          <circle cx="42" cy="106" r="8" fill={paint("bubble")} stroke={edge} strokeWidth="1.5" /><circle cx="157" cy="79" r="11" fill={paint("bubble")} stroke={edge} strokeWidth="1.5" /><circle cx="171" cy="121" r="5" fill={paint("bubble")} /><path d="M153 74q3-3 6-1m-120 30 2-1" stroke="#F3FFF9" strokeWidth="2" strokeLinecap="round" />
        </motion.g>
        <motion.g data-part="jelly-body" animate={state} variants={settledBodyVariants} style={{ transformOrigin: "100px 218px", transformBox: "view-box" }}>
          <CharacterCosmetics characterType="slime" loadout={loadout} layer="behind" />
          <path d="M38 208c0-16 9-28 18-39-3-13-1-34 8-52 13-27 34-47 36-77 2 30 25 50 38 77 9 18 11 39 7 52 10 11 18 23 18 39 0 19-16 27-34 23-11-2-19-2-29 3-10-5-18-5-29-3-18 4-33-4-33-23z" fill={paint("jelly")} stroke={edge} strokeWidth="3" strokeLinejoin="round" />
          <path d="M55 198q45 24 90 0q8 15-9 23q-36-8-72 0q-16-8-9-23Z" fill={edge} opacity=".15" />
          <ellipse cx="100" cy="184" rx="37" ry="35" fill={paint("belly")} />
          <path d="M74 113q11-22 20-34" stroke="#F0FFF8" strokeWidth="8" strokeLinecap="round" opacity=".7" />
          <path d="M99 62q-2 8-5 13m-32 57-2 7" stroke="#F0FFF8" strokeWidth="3" strokeLinecap="round" opacity=".75" />
          <path d="M149 190q10 21-5 28m-94-11q-2 10 7 13" fill="none" stroke={shine} strokeWidth="3" strokeLinecap="round" opacity=".55" />
          <ellipse cx="59" cy="153" rx="12" ry="8" fill="#F7A6AE" opacity={error || emotion === "angry" ? 0 : .55} /><ellipse cx="141" cy="153" rx="12" ry="8" fill="#F7A6AE" opacity={error || emotion === "angry" ? 0 : .55} />
          <Face emotion={emotion} error={error} />
          <circle cx="134" cy="184" r="7" fill={paint("bubble")} stroke={shine} strokeWidth="1" opacity=".65" /><circle cx="66" cy="191" r="4" fill={paint("bubble")} opacity=".65" /><circle cx="121" cy="203" r="3" fill={shine} opacity=".35" />
          <CharacterCosmetics characterType="slime" loadout={loadout} layer="front" />
        </motion.g>
      </svg>
    </div>
  );
}
