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
} from "./robotAnimations";

interface RobotCharacterProps {
  state: RobotState;
  size?: number;
}

export default function RobotCharacter({ state, size = 140 }: RobotCharacterProps) {
  const isError = state === "error";
  const bodyColor = isError ? "#ef4444" : "#3b82f6";
  const headColor = isError ? "#dc2626" : "#2563eb";
  const eyeColor = isError ? "#fca5a5" : "#93c5fd";
  const accentColor = isError ? "#fef2f2" : "#dbeafe";

  return (
    <motion.div
      animate={state}
      variants={bodyVariants}
      style={{ width: size, height: size * 1.4, position: "relative", display: "inline-block" }}
    >
      <svg
        viewBox="0 0 100 140"
        width={size}
        height={size * 1.4}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Antenna */}
        <motion.g
          animate={state}
          variants={{
            idle: { opacity: [1, 0.4, 1], transition: { duration: 1.5, repeat: Infinity } },
            talking: { opacity: [1, 0.2, 1], transition: { duration: 0.3, repeat: Infinity } },
            celebrating: { opacity: [1, 0, 1, 0, 1], transition: { duration: 0.3, repeat: 5 } },
            walking: {}, jumping: {}, headShake: {}, error: {},
          }}
        >
          <line x1="50" y1="14" x2="50" y2="4" stroke={accentColor} strokeWidth="2" strokeLinecap="round" />
          <circle cx="50" cy="2" r="3" fill={isError ? "#fca5a5" : "#60a5fa"} />
        </motion.g>

        {/* Head */}
        <motion.g animate={state} variants={headVariants} style={{ originX: "50px", originY: "25px" }}>
          <rect x="30" y="12" width="40" height="32" rx="8" fill={headColor} />
          {/* Eyes */}
          <motion.circle
            cx="40"
            cy="25"
            r="5"
            fill={eyeColor}
            animate={state === "talking" || state === "celebrating"
              ? { scaleY: [1, 0.1, 1], transition: { duration: 0.8, repeat: Infinity } }
              : {}}
          />
          <motion.circle
            cx="60"
            cy="25"
            r="5"
            fill={eyeColor}
            animate={state === "talking" || state === "celebrating"
              ? { scaleY: [1, 0.1, 1], transition: { duration: 0.8, repeat: Infinity, delay: 0.1 } }
              : {}}
          />
          {/* Pupils */}
          <circle cx="41" cy="25" r="2" fill={isError ? "#7f1d1d" : "#1e3a8a"} />
          <circle cx="61" cy="25" r="2" fill={isError ? "#7f1d1d" : "#1e3a8a"} />
          {/* Mouth */}
          {state === "error" ? (
            <path d="M40 36 Q50 32 60 36" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          ) : (
            <path d="M40 36 Q50 40 60 36" stroke={accentColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          )}
        </motion.g>

        {/* Neck */}
        <rect x="44" y="44" width="12" height="6" rx="3" fill={bodyColor} />

        {/* Body */}
        <motion.g animate={state} variants={{ celebrating: { scale: [1, 1.05, 1], transition: { duration: 0.4, repeat: 4 } }, idle: {}, talking: {}, walking: {}, jumping: {}, headShake: {}, error: {} }}>
          <rect x="24" y="50" width="52" height="42" rx="10" fill={bodyColor} />
          {/* Screen on body */}
          <rect x="32" y="58" width="36" height="22" rx="4" fill={isError ? "#7f1d1d" : "#1e3a8a"} />
          {/* Screen content */}
          {state === "talking" || state === "celebrating" ? (
            <>
              <motion.rect x="36" y="63" width="28" height="3" rx="1.5" fill={accentColor}
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity }} />
              <motion.rect x="36" y="69" width="20" height="3" rx="1.5" fill={accentColor}
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }} />
              <motion.rect x="36" y="75" width="24" height="3" rx="1.5" fill={accentColor}
                animate={{ opacity: [1, 0, 1] }} transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }} />
            </>
          ) : (
            <>
              <rect x="36" y="63" width="28" height="3" rx="1.5" fill={accentColor} opacity="0.5" />
              <rect x="36" y="69" width="20" height="3" rx="1.5" fill={accentColor} opacity="0.5" />
              <rect x="36" y="75" width="24" height="3" rx="1.5" fill={accentColor} opacity="0.5" />
            </>
          )}
          {/* Chest indicator light */}
          <motion.circle cx="50" cy="87" r="3" fill={isError ? "#ef4444" : "#22d3ee"}
            animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        </motion.g>

        {/* Left Arm */}
        <motion.g
          animate={state}
          variants={leftArmVariants}
          style={{ originX: "24px", originY: "55px" }}
        >
          <rect x="12" y="52" width="12" height="30" rx="6" fill={bodyColor} />
          <circle cx="18" cy="84" r="5" fill={headColor} />
        </motion.g>

        {/* Right Arm */}
        <motion.g
          animate={state}
          variants={rightArmVariants}
          style={{ originX: "76px", originY: "55px" }}
        >
          <rect x="76" y="52" width="12" height="30" rx="6" fill={bodyColor} />
          <circle cx="82" cy="84" r="5" fill={headColor} />
        </motion.g>

        {/* Left Leg */}
        <motion.g
          animate={state}
          variants={leftLegVariants}
          style={{ originX: "38px", originY: "92px" }}
        >
          <rect x="30" y="92" width="14" height="30" rx="7" fill={bodyColor} />
          <rect x="26" y="118" width="18" height="10" rx="5" fill={headColor} />
        </motion.g>

        {/* Right Leg */}
        <motion.g
          animate={state}
          variants={rightLegVariants}
          style={{ originX: "62px", originY: "92px" }}
        >
          <rect x="56" y="92" width="14" height="30" rx="7" fill={bodyColor} />
          <rect x="56" y="118" width="18" height="10" rx="5" fill={headColor} />
        </motion.g>
      </svg>
    </motion.div>
  );
}
