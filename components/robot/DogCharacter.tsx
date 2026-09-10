"use client";

import { motion, Variants } from "framer-motion";
import { useId } from "react";
import type { RobotState, RobotEmotion } from "@/types";
import type { CharacterLoadout } from "@/types";
import CharacterCosmetics from "./CharacterCosmetics";
import { restingBodyPose, withRestingPose } from "./poseTransitions";

interface DogCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
  loadout?: CharacterLoadout;
}

// 강아지 모션 variants
const bodyVariants: Variants = withRestingPose({
  idle: { x: 0, rotate: 0, scale: 1, scaleY: 1, y: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  talking: { y: [0, -2, 0], transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" } },
  walking: {
    y: [0, -3, 0, -3, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
  },
  jumping: {
    y: [0, -50, -50, 0],
    scaleY: [1, 1.1, 1.1, 0.9, 1],
    transition: { duration: 0.6, ease: "easeOut" },
  },
  celebrating: {
    rotate: [0, 5, -5, 5, -5, 0],
    scale: [1, 1.08, 1.08, 1.15, 1],
    y: [0, -8, -8, -4, 0],
    transition: { duration: 0.8, repeat: 3, ease: "easeInOut" },
  },
  error: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.5, ease: "easeInOut" } },
  headShake: { x: [0, -8, 8, -8, 8, 0], transition: { duration: .6 } },
  spinning: { rotate: [0, 360], transition: { duration: .7, ease: "easeInOut" } },
  shaking: { x: [0, -10, 10, -10, 10, 0], transition: { duration: .5 } },
}, restingBodyPose);

const headVariants: Variants = withRestingPose({
  idle: { rotate: [0, 1.5, 0, -1.5, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  talking: { rotate: [0, 3, -3, 3, 0], transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } },
  walking: { rotate: [2, -2, 2], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [0, -3, 0], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 8, -8, 8, 0], transition: { duration: 0.4, repeat: 4, ease: "easeInOut" } },
  error: { rotate: [-4, 4, -4, 0], transition: { duration: 0.4 } },
  headShake: { rotate: [0, -8, 8, -8, 0], transition: { duration: .6 } },
  spinning: {},
  shaking: {},
}, { rotate: 0 });

const earLVariants: Variants = {
  idle: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, 15, 0], transition: { duration: 0.5, repeat: Infinity } },
  walking: { rotate: [10, -10, 10], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-20], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, -25, 0, -25, 0], transition: { duration: 0.4, repeat: 3 } },
  error: { rotate: [15], transition: { duration: 0.3 } },
};

const earRVariants: Variants = {
  idle: { rotate: [0, -5, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, -15, 0], transition: { duration: 0.5, repeat: Infinity } },
  walking: { rotate: [-10, 10, -10], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [20], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 25, 0, 25, 0], transition: { duration: 0.4, repeat: 3 } },
  error: { rotate: [-15], transition: { duration: 0.3 } },
};

const tailVariants: Variants = {
  idle: { rotate: [0, 10, -10, 0], transition: { duration: 1.5, repeat: Infinity } },
  talking: { rotate: [0, 25, -25, 0], transition: { duration: 0.5, repeat: Infinity } },
  walking: { rotate: [15, -15, 15], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-15], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 45, -45, 45, -45, 0], transition: { duration: 0.3, repeat: 8 } },
  error: { rotate: [-30], transition: { duration: 0.4 } },
};

const restingLeg = { rotate: 0, transition: { duration: .18, ease: "easeOut" as const } };
const legLVariants: Variants = {
  idle: restingLeg,
  talking: restingLeg,
  walking: { rotate: [-25, 25, -25], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-15], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, -15, 15, 0], transition: { duration: 0.4, repeat: 3 } },
  error: restingLeg,
  headShake: restingLeg,
  spinning: restingLeg,
  shaking: restingLeg,
};

const legRVariants: Variants = {
  idle: restingLeg,
  talking: restingLeg,
  walking: { rotate: [25, -25, 25], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [15], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 15, -15, 0], transition: { duration: 0.4, repeat: 3 } },
  error: restingLeg,
  headShake: restingLeg,
  spinning: restingLeg,
  shaking: restingLeg,
};

export default function DogCharacter({
  state,
  emotion = "idle",
  scale = 1.0,
  direction = "right",
  size = 184,
  loadout,
}: DogCharacterProps) {
  const isError = state === "error";

  const h = Math.round(size * (226 / 184));
  const directionScaleX = direction === "left" ? -1 : 1;

  // 감정 및 에러에 따른 색상 매핑
  const getColorPalette = () => {
    if (isError) {
      return {
        furMain: "#FFAAA6",
        furWhite: "#FFF0F0",
        collar: "#EF4444",
        pendant: "#FBBF24",
        eye: "#5C1D1D",
        nose: "#5C1D1D",
        mouth: "#5C1D1D",
        sparkle: "none",
        blush: "#FFAAA6",
      };
    }
    switch (emotion) {
      case "sad":
        return {
          furMain: "#C8C2BC",
          furWhite: "#F3F2F0",
          collar: "#6B7280",
          pendant: "#D1D5DB",
          eye: "#374151",
          nose: "#1F2937",
          mouth: "#374151",
          sparkle: "none",
          blush: "transparent",
        };
      case "angry":
        return {
          furMain: "#D97706",
          furWhite: "#FFFBEB",
          collar: "#EF4444",
          pendant: "#F59E0B",
          eye: "#7F1D1D",
          nose: "#000000",
          mouth: "#7F1D1D",
          sparkle: "none",
          blush: "#FFAAA6",
        };
      case "surprised":
        return {
          furMain: "#F59E0B",
          furWhite: "#FFFBEB",
          collar: "#3B82F6",
          pendant: "#FFF500",
          eye: "#000000",
          nose: "#000000",
          mouth: "#000000",
          sparkle: "#FFFFFF",
          blush: "#FCD34D",
        };
      case "happy":
      case "idle":
      default:
        return {
          furMain: "#E29555",
          furWhite: "#FCF9F5",
          collar: "#FF5F7E",
          pendant: "#FFF380",
          eye: "#2D2621",
          nose: "#000000",
          mouth: "#2D2621",
          sparkle: "#FFFFFF",
          blush: "#FFC0D0",
        };
    }
  };

  const colors = getColorPalette();
  const paintId = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${paintId}-${name})`;
  const furEdge = isError ? "#CC827C" : emotion === "sad" ? "#AAA29B" : "#B77C4F";
  const furLight = isError ? "#FFDAD6" : emotion === "sad" ? "#E4DFD8" : "#F6CD9D";
  const furShade = isError ? "#E89D98" : emotion === "sad" ? "#B5ADA7" : "#CB864B";

  const renderEyes = () => {
    if (isError) {
      return (
        <>
          <path d="M 68 85 L 82 95 M 82 85 L 68 95" stroke={colors.eye} strokeWidth="4" strokeLinecap="round" />
          <path d="M 118 85 L 132 95 M 132 85 L 118 95" stroke={colors.eye} strokeWidth="4" strokeLinecap="round" />
        </>
      );
    }
    switch (emotion) {
      case "happy":
        return (
          <>
            <path d="M 66 94 Q 75 80 84 94" stroke={colors.eye} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 116 94 Q 125 80 134 94" stroke={colors.eye} strokeWidth="5" fill="none" strokeLinecap="round" />
          </>
        );
      case "sad":
        return (
          <>
            <circle cx="75" cy="92" r="6.5" fill={colors.eye} />
            <circle cx="125" cy="92" r="6.5" fill={colors.eye} />
            <path d="M 68 82 Q 75 86 82 82" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 118 82 Q 125 86 132 82" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "angry":
        return (
          <>
            <circle cx="75" cy="94" r="6" fill={colors.eye} />
            <circle cx="125" cy="94" r="6" fill={colors.eye} />
            <path d="M 64 80 L 86 90" stroke="#7F1D1D" strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 136 80 L 114 90" stroke="#7F1D1D" strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx="75" cy="92" r="11" fill={colors.eye} />
            <circle cx="125" cy="92" r="11" fill={colors.eye} />
            {colors.sparkle !== "none" && (
              <>
                <circle cx="72" cy="88" r="4.5" fill={colors.sparkle} />
                <circle cx="122" cy="88" r="4.5" fill={colors.sparkle} />
              </>
            )}
          </>
        );
      default:
        return (
          <>
            <ellipse cx="75" cy="92" rx="8.5" ry="10" fill={paint("eyes")} />
            <ellipse cx="125" cy="92" rx="8.5" ry="10" fill={paint("eyes")} />
            {colors.sparkle !== "none" && (
              <>
                <circle cx="72" cy="88" r="3.5" fill={colors.sparkle} />
                <circle cx="122" cy="88" r="3.5" fill={colors.sparkle} />
                <circle cx="78" cy="96" r="1.6" fill={colors.sparkle} opacity=".7" />
                <circle cx="128" cy="96" r="1.6" fill={colors.sparkle} opacity=".7" />
              </>
            )}
          </>
        );
    }
  };

  const renderMouthAndTongue = () => {
    if (isError) {
      return <path d="M 94 118 Q 100 112 106 118" stroke={colors.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    switch (emotion) {
      case "happy":
        return (
          <g>
            <path d="M 90 109 Q 100 118 110 109" stroke={colors.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* 낼름거리는 귀여운 분홍 혀 */}
            <motion.path
              d="M 96 112 Q 100 126 104 112 Z"
              fill="#FF7A8E"
              animate={{ y: [0, 2, 0] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </g>
        );
      case "sad":
        return <path d="M 93 118 Q 100 110 107 118" stroke={colors.mouth} strokeWidth="3.2" fill="none" strokeLinecap="round" />;
      case "angry":
        return <path d="M 92 116 L 108 116" stroke={colors.mouth} strokeWidth="3.2" strokeLinecap="round" />;
      case "surprised":
        return <circle cx="100" cy="115" r="5" stroke={colors.mouth} strokeWidth="3" fill="none" />;
      default:
        return <path d="M 93 110 Q 100 117 107 110" stroke={colors.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
  };

  return (
    <div
      data-character="dog"
      style={{
        width: size,
        height: h,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        transform: `scaleX(${directionScaleX})`,
        transformOrigin: "bottom center",
      }}
    >
      <svg
        viewBox="0 0 200 250"
        width={size * scale}
        height={h * scale}
        preserveAspectRatio="xMidYMax meet"
        style={{ overflow: "visible", flexShrink: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`${paintId}-fur`} x1=".2" y1="0" x2=".7" y2="1"><stop stopColor={furLight} /><stop offset=".48" stopColor={colors.furMain} /><stop offset="1" stopColor={furShade} /></linearGradient>
          <linearGradient id={`${paintId}-cream`} x2=".3" y2="1"><stop stopColor="#FFFFFF" /><stop offset=".6" stopColor={colors.furWhite} /><stop offset="1" stopColor={emotion === "sad" ? "#DEDAD4" : "#F2DFCC"} /></linearGradient>
          <linearGradient id={`${paintId}-ear`} x2=".7" y2="1"><stop stopColor="#FFD7DF" /><stop offset="1" stopColor="#E89AB4" /></linearGradient>
          <linearGradient id={`${paintId}-eyes`} x2=".2" y2="1"><stop stopColor={colors.eye} /><stop offset=".6" stopColor={colors.eye} /><stop offset="1" stopColor="#9D704E" /></linearGradient>
          <radialGradient id={`${paintId}-gold`} cx=".3" cy=".25" r=".85"><stop stopColor="#FFFDE4" /><stop offset=".4" stopColor={colors.pendant} /><stop offset="1" stopColor="#E5AD53" /></radialGradient>
        </defs>
        {/* Keep commanded size separate from squash/stretch animations. */}
        <motion.g data-part="character-body" animate={state} variants={bodyVariants} style={{ transformOrigin: "100px 250px" }}>
        <CharacterCosmetics characterType="dog" loadout={loadout} layer="behind" />
        {/* Shadow */}
        <ellipse cx="100" cy="235" rx="58" ry="8" fill="#58483B" opacity="0.14" />

        {/* Tail */}
        <motion.path
          d="M 52 178 Q 20 162 25 142 Q 32 135 44 148 Q 50 160 52 178"
          fill={paint("fur")}
          stroke={furEdge}
          strokeWidth="2"
          animate={state}
          variants={tailVariants}
          style={{ originX: "52px", originY: "178px", transformBox: "view-box" }}
        />

        {/* Back Left Leg */}
        <motion.g data-part="back-left-leg" animate={state} variants={legLVariants} style={{ originX: "75px", originY: "190px", transformBox: "view-box" }}>
          <rect x="65" y="180" width="18" height="48" rx="9" fill={paint("fur")} stroke={furEdge} strokeWidth="1.5" />
          <circle cx="74" cy="222" r="10" fill={paint("cream")} stroke={furEdge} strokeWidth="1.5" />
        </motion.g>

        {/* Back Right Leg */}
        <motion.g data-part="back-right-leg" animate={state} variants={legRVariants} style={{ originX: "125px", originY: "190px", transformBox: "view-box" }}>
          <rect x="117" y="180" width="18" height="48" rx="9" fill={paint("fur")} stroke={furEdge} strokeWidth="1.5" />
          <circle cx="126" cy="222" r="10" fill={paint("cream")} stroke={furEdge} strokeWidth="1.5" />
        </motion.g>

        {/* Body (Corgi style long body) */}
        <g>
          <rect x="52" y="132" width="96" height="64" rx="28" fill={paint("fur")} stroke={furEdge} strokeWidth="2" />
          <ellipse cx="100" cy="172" rx="34" ry="24" fill={paint("cream")} />
          <path d="m84 154 8 5 8-6 8 6 8-5" stroke="#FFFDF8" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx="78" cy="145" rx="18" ry="8" fill="#FFFFFF" opacity="0.18" />
        </g>

        {/* Front Left Leg */}
        <motion.g data-part="front-left-leg" animate={state} variants={legLVariants} style={{ originX: "90px", originY: "190px", transformBox: "view-box" }}>
          <rect x="80" y="185" width="18" height="45" rx="9" fill={paint("fur")} stroke={furEdge} strokeWidth="1.5" />
          <circle cx="89" cy="224" r="10" fill={paint("cream")} stroke={furEdge} strokeWidth="1.5" />
          <path d="M85 225v5m5-5v6" stroke="#CEB29C" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Front Right Leg */}
        <motion.g data-part="front-right-leg" animate={state} variants={legRVariants} style={{ originX: "110px", originY: "190px", transformBox: "view-box" }}>
          <rect x="102" y="185" width="18" height="45" rx="9" fill={paint("fur")} stroke={furEdge} strokeWidth="1.5" />
          <circle cx="111" cy="224" r="10" fill={paint("cream")} stroke={furEdge} strokeWidth="1.5" />
          <path d="M107 225v5m5-5v6" stroke="#CEB29C" strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Collar */}
        <g>
          <path d="M 72 135 C 72 135 100 148 128 135 L 126 142 C 126 142 100 154 74 142 Z" fill={colors.collar} />
          {/* Gold Pendant */}
          <circle cx="100" cy="148" r="8.5" fill={paint("gold")} stroke="#D4A264" strokeWidth="1.3" />
          <path d="m100 143 1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5Z" fill="#FFFCEE" />
        </g>

        {/* Head + Ears + Face (grouped to sway together) */}
        <motion.g data-part="character-head" animate={state} variants={headVariants} style={{ originX: "100px", originY: "115px", transformBox: "view-box" }}>
          {/* Left Ear */}
          <motion.g
            animate={state}
            variants={earLVariants}
            style={{ originX: "52px", originY: "64px", transformBox: "view-box" }}
          >
            {/* Outer Ear */}
            <path d="M 32 30 Q 55 12 62 65 Z" fill={paint("fur")} stroke={furEdge} strokeWidth="2" strokeLinejoin="round" />
            {/* Inner Pink Ear */}
            <path d="M 40 37 Q 52 24 57 60 Z" fill={paint("ear")} />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            animate={state}
            variants={earRVariants}
            style={{ originX: "148px", originY: "64px", transformBox: "view-box" }}
          >
            {/* Outer Ear */}
            <path d="M 168 30 Q 145 12 138 65 Z" fill={paint("fur")} stroke={furEdge} strokeWidth="2" strokeLinejoin="round" />
            {/* Inner Pink Ear */}
            <path d="M 160 37 Q 148 24 143 60 Z" fill={paint("ear")} />
          </motion.g>

          {/* Head Shape */}
          <circle cx="100" cy="96" r="52" fill={paint("fur")} stroke={furEdge} strokeWidth="2" />
          <path d="M82 49 Q88 30 99 46 Q108 27 114 49 Q124 35 127 57" fill={furLight} stroke={furLight} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M87 45q5-6 10 2m8-4q4-6 7 2" stroke="#FFE5C4" strokeWidth="2" strokeLinecap="round" fill="none" />
          <ellipse cx="78" cy="62" rx="20" ry="10" fill="#FFFFFF" opacity="0.2" transform="rotate(-18 78 62)" />
          {/* White Snout Pattern */}
          <path d="M 78 125 C 78 125 100 134 122 125 C 122 125 126 100 100 96 C 74 100 78 125 78 125" fill={paint("cream")} />
          <path d="m78 119-5 1m49-1 5 1" stroke="#D4AA82" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 94 96 L 106 96 L 100 112 Z" fill={colors.furWhite} />

          {/* Cheeks Blush */}
          {colors.blush !== "transparent" && (
            <>
              <ellipse cx="60" cy="112" rx="9" ry="6.5" fill={colors.blush} opacity="0.85" />
              <ellipse cx="140" cy="112" rx="9" ry="6.5" fill={colors.blush} opacity="0.85" />
            </>
          )}

          {/* Eyes */}
          {renderEyes()}

          {/* Nose */}
          <ellipse cx="100" cy="104" rx="8.5" ry="5.5" fill={colors.nose} />
          <ellipse cx="97" cy="102" rx="2.8" ry="1.7" fill="#FFFFFF" opacity="0.7" />

          {/* Mouth and Tongue */}
          {renderMouthAndTongue()}
        <CharacterCosmetics characterType="dog" loadout={loadout} layer="front" slots={["head", "face"]} />
        </motion.g>
        <CharacterCosmetics characterType="dog" loadout={loadout} layer="front" slots={["body"]} />
        </motion.g>
      </svg>
    </div>
  );
}
