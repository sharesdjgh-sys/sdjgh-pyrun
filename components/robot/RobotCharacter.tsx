"use client";

import { motion } from "framer-motion";
import type { RobotState } from "@/types";
import {
  bodyVariants,
  headVariants,
  leftArmVariants,
  rightArmVariants,
  leftLegVariants,
  rightLegVariants,
} from "@/components/robot/robotAnimations";

interface RobotCharacterProps {
  state: RobotState;
  size?: number;
}

export default function RobotCharacter({ state, size = 184 }: RobotCharacterProps) {
  const h = Math.round(size * (226 / 184));

  return (
    <motion.div
      animate={state}
      variants={bodyVariants}
      style={{ width: size, height: h, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <svg
        viewBox="0 0 200 250"
        width={size}
        height={h}
        preserveAspectRatio="xMidYMax meet"
        style={{ overflow: "visible" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shadow */}
        <ellipse cx="100" cy="245" rx="54" ry="7" fill="#B98FE6" opacity="0.16" />

        {/* Left Leg */}
        <motion.g animate={state} variants={leftLegVariants} style={{ transformOrigin: "89px 196px" }}>
          <rect x="78" y="196" width="22" height="34" rx="11" fill="#FBF7FF" />
          <rect x="62" y="222" width="36" height="22" rx="11" fill="#FFFFFF" stroke="#ECE0FA" strokeWidth="1.5" />
          <rect x="62" y="235" width="36" height="9" rx="4.5" fill="#C6A2EC" />
        </motion.g>

        {/* Right Leg */}
        <motion.g animate={state} variants={rightLegVariants} style={{ transformOrigin: "111px 196px" }}>
          <rect x="100" y="196" width="22" height="34" rx="11" fill="#FBF7FF" />
          <rect x="102" y="222" width="36" height="22" rx="11" fill="#FFFFFF" stroke="#ECE0FA" strokeWidth="1.5" />
          <rect x="102" y="235" width="36" height="9" rx="4.5" fill="#C6A2EC" />
        </motion.g>

        {/* Left Arm */}
        <motion.g animate={state} variants={leftArmVariants} style={{ transformOrigin: "56px 162px" }}>
          <rect x="42" y="160" width="20" height="32" rx="10" fill="#FBF7FF" />
          <ellipse cx="55" cy="161" rx="15" ry="13" fill="#C6A2EC" />
          <circle cx="49" cy="196" r="13" fill="#C6A2EC" />
          <circle cx="39" cy="190" r="6" fill="#C6A2EC" />
          <ellipse cx="46" cy="192" rx="4" ry="3" fill="#FFFFFF" opacity="0.45" />
        </motion.g>

        {/* Right Arm */}
        <motion.g animate={state} variants={rightArmVariants} style={{ transformOrigin: "144px 162px" }}>
          <rect x="138" y="160" width="20" height="32" rx="10" fill="#FBF7FF" />
          <ellipse cx="145" cy="161" rx="15" ry="13" fill="#C6A2EC" />
          <circle cx="151" cy="196" r="13" fill="#C6A2EC" />
          <circle cx="161" cy="190" r="6" fill="#C6A2EC" />
          <ellipse cx="148" cy="192" rx="4" ry="3" fill="#FFFFFF" opacity="0.45" />
        </motion.g>

        {/* Body */}
        <g>
          <rect x="54" y="150" width="92" height="74" rx="36" fill="#FCF9FF" stroke="#ECE0FA" strokeWidth="1.5" />
          <ellipse cx="80" cy="166" rx="22" ry="11" fill="#FFFFFF" opacity="0.7" />
          <text x="100" y="186" textAnchor="middle" fontFamily="'Jua', sans-serif" fontSize="30" fill="#C29BEC" letterSpacing="1">AI</text>
          <rect x="58" y="196" width="84" height="15" rx="7.5" fill="#C6A2EC" />
          {[70, 82, 94, 106, 118, 130].map((cx) => (
            <circle key={cx} cx={cx} cy="203.5" r="2.1" fill="#FBF4FF" />
          ))}
        </g>

        {/* Head + Headphones + Antenna + Bow (grouped so they all move together) */}
        <motion.g animate={state} variants={headVariants} style={{ transformOrigin: "100px 95px" }}>
          {/* Headphones */}
          <circle cx="35" cy="96" r="20" fill="#D0B6F2" />
          <ellipse cx="35" cy="96" rx="8.5" ry="13" fill="#EFE4FB" />
          <circle cx="165" cy="96" r="20" fill="#D0B6F2" />
          <ellipse cx="165" cy="96" rx="8.5" ry="13" fill="#EFE4FB" />

          {/* Head */}
          <rect x="28" y="40" width="144" height="110" rx="50" fill="#FCF9FF" stroke="#ECE0FA" strokeWidth="2" />
          <ellipse cx="70" cy="66" rx="34" ry="16" fill="#FFFFFF" opacity="0.65" />
          <ellipse cx="100" cy="140" rx="60" ry="15" fill="#EEE2FB" opacity="0.55" />
          <rect x="44" y="60" width="112" height="70" rx="32" fill="#FFFFFF" stroke="#E7DAF7" strokeWidth="3" />

          {/* Eyebrows */}
          <path d="M69 73q9 -6 18 -1.5" stroke="#C49BE8" strokeWidth="3.6" fill="none" strokeLinecap="round" />
          <path d="M113 71.5q9 -4.5 18 1.5" stroke="#C49BE8" strokeWidth="3.6" fill="none" strokeLinecap="round" />

          {/* Cheeks */}
          <ellipse cx="59" cy="113" rx="11" ry="7.5" fill={state === "error" ? "#FF8080" : "#F4A6C2"} opacity="0.8" />
          <ellipse cx="141" cy="113" rx="11" ry="7.5" fill={state === "error" ? "#FF8080" : "#F4A6C2"} opacity="0.8" />

          {/* Eyes (blink CSS kept — separate from Framer Motion rotate) */}
          <g style={{ transformOrigin: "100px 96px", animation: "blinkEye 4.6s ease-in-out infinite" }}>
            <ellipse cx="78" cy="96" rx="15" ry="18" fill={state === "error" ? "#442244" : "#2B2440"} />
            <ellipse cx="122" cy="96" rx="15" ry="18" fill={state === "error" ? "#442244" : "#2B2440"} />
            <circle cx="73" cy="88" r="5" fill="#FFFFFF" />
            <circle cx="117" cy="88" r="5" fill="#FFFFFF" />
            <circle cx="83" cy="103" r="2.4" fill="#FFFFFF" opacity="0.55" />
            <circle cx="127" cy="103" r="2.4" fill="#FFFFFF" opacity="0.55" />
          </g>

          {/* Mouth */}
          {state === "error" ? (
            <path d="M92 117q8 -6 16 0" stroke="#3A2E4A" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M92 113q8 8 16 0" stroke="#3A2E4A" strokeWidth="3.2" fill="none" strokeLinecap="round" />
          )}

          {/* Antenna */}
          <line x1="100" y1="36" x2="100" y2="14" stroke="#C49BE8" strokeWidth="5" strokeLinecap="round" />
          <circle
            cx="100" cy="9" r="9"
            fill={state === "talking" || state === "celebrating" ? "#A78BFA" : "#C6A2EC"}
            style={{ transformOrigin: "100px 9px", animation: "antGlow 1.9s ease-in-out infinite" }}
          />

          {/* Hair Bow */}
          <g style={{ transformOrigin: "64px 40px", animation: "bowSway 3.6s ease-in-out infinite" }}>
            <ellipse cx="50" cy="40" rx="12" ry="9.5" fill="#C9A4EE" />
            <ellipse cx="79" cy="39" rx="12" ry="9.5" fill="#CDABF1" />
            <ellipse cx="48" cy="38" rx="5" ry="3.5" fill="#FFFFFF" opacity="0.35" />
            <circle cx="64" cy="40" r="7.5" fill="#B98FE6" />
          </g>
        </motion.g>
      </svg>
    </motion.div>
  );
}
