"use client";

import { motion, Variants } from "framer-motion";
import type { RobotState, RobotEmotion } from "@/types";

interface DogCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
}

// 강아지 모션 variants
const bodyVariants: Variants = {
  idle: { y: [0, -3, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
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
};

const headVariants: Variants = {
  idle: { rotate: [0, 1.5, 0, -1.5, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  talking: { rotate: [0, 3, -3, 3, 0], transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } },
  walking: { rotate: [2, -2, 2], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [0, -3, 0], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 8, -8, 8, 0], transition: { duration: 0.4, repeat: 4, ease: "easeInOut" } },
  error: { rotate: [-4, 4, -4, 0], transition: { duration: 0.4 } },
};

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

const legLVariants: Variants = {
  idle: {},
  talking: {},
  walking: { rotate: [-25, 25, -25], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-15], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, -15, 15, 0], transition: { duration: 0.4, repeat: 3 } },
  error: {},
};

const legRVariants: Variants = {
  idle: {},
  talking: {},
  walking: { rotate: [25, -25, 25], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [15], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 15, -15, 0], transition: { duration: 0.4, repeat: 3 } },
  error: {},
};

export default function DogCharacter({
  state,
  emotion = "idle",
  scale = 1.0,
  direction = "right",
  size = 184,
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
            <circle cx="75" cy="92" r="8.5" fill={colors.eye} />
            <circle cx="125" cy="92" r="8.5" fill={colors.eye} />
            {colors.sparkle !== "none" && (
              <>
                <circle cx="72" cy="88" r="3.5" fill={colors.sparkle} />
                <circle cx="122" cy="88" r="3.5" fill={colors.sparkle} />
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
    <motion.div
      animate={state}
      variants={bodyVariants}
      style={{
        width: size,
        height: h,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        scale: scale,
        scaleX: directionScaleX * scale,
        transformOrigin: "bottom center",
      }}
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
        <ellipse cx="100" cy="235" rx="58" ry="8" fill="#58483B" opacity="0.14" />

        {/* Tail */}
        <motion.path
          d="M 52 178 Q 20 162 25 142 Q 32 135 44 148 Q 50 160 52 178"
          fill={colors.furMain}
          animate={state}
          variants={tailVariants}
          style={{ originX: "52px", originY: "178px", transformBox: "view-box" }}
        />

        {/* Back Left Leg */}
        <motion.g animate={state} variants={legLVariants} style={{ originX: "75px", originY: "190px", transformBox: "view-box" }}>
          <rect x="65" y="180" width="18" height="48" rx="9" fill={colors.furMain} />
          <circle cx="74" cy="222" r="10" fill={colors.furWhite} />
        </motion.g>

        {/* Back Right Leg */}
        <motion.g animate={state} variants={legRVariants} style={{ originX: "125px", originY: "190px", transformBox: "view-box" }}>
          <rect x="117" y="180" width="18" height="48" rx="9" fill={colors.furMain} />
          <circle cx="126" cy="222" r="10" fill={colors.furWhite} />
        </motion.g>

        {/* Body (Corgi style long body) */}
        <g>
          <rect x="52" y="132" width="96" height="64" rx="28" fill={colors.furMain} />
          <ellipse cx="100" cy="172" rx="34" ry="24" fill={colors.furWhite} />
        </g>

        {/* Front Left Leg */}
        <motion.g animate={state} variants={legLVariants} style={{ originX: "90px", originY: "190px", transformBox: "view-box" }}>
          <rect x="80" y="185" width="18" height="45" rx="9" fill={colors.furMain} />
          <circle cx="89" cy="224" r="10" fill={colors.furWhite} />
        </motion.g>

        {/* Front Right Leg */}
        <motion.g animate={state} variants={legRVariants} style={{ originX: "110px", originY: "190px", transformBox: "view-box" }}>
          <rect x="102" y="185" width="18" height="45" rx="9" fill={colors.furMain} />
          <circle cx="111" cy="224" r="10" fill={colors.furWhite} />
        </motion.g>

        {/* Collar */}
        <g>
          <path d="M 72 135 C 72 135 100 148 128 135 L 126 142 C 126 142 100 154 74 142 Z" fill={colors.collar} />
          {/* Gold Pendant */}
          <circle cx="100" cy="148" r="8.5" fill={colors.pendant} />
          <circle cx="100" cy="148" r="4.5" fill="#FFF" opacity="0.6" />
        </g>

        {/* Head + Ears + Face (grouped to sway together) */}
        <motion.g animate={state} variants={headVariants} style={{ originX: "100px", originY: "115px", transformBox: "view-box" }}>
          {/* Left Ear */}
          <motion.g
            animate={state}
            variants={earLVariants}
            style={{ originX: "52px", originY: "64px", transformBox: "view-box" }}
          >
            {/* Outer Ear */}
            <path d="M 32 30 Q 55 12 62 65 Z" fill={colors.furMain} />
            {/* Inner Pink Ear */}
            <path d="M 40 37 Q 52 24 57 60 Z" fill="#FFAEC9" />
          </motion.g>

          {/* Right Ear */}
          <motion.g
            animate={state}
            variants={earRVariants}
            style={{ originX: "148px", originY: "64px", transformBox: "view-box" }}
          >
            {/* Outer Ear */}
            <path d="M 168 30 Q 145 12 138 65 Z" fill={colors.furMain} />
            {/* Inner Pink Ear */}
            <path d="M 160 37 Q 148 24 143 60 Z" fill="#FFAEC9" />
          </motion.g>

          {/* Head Shape */}
          <circle cx="100" cy="96" r="52" fill={colors.furMain} />
          {/* White Snout Pattern */}
          <path d="M 78 125 C 78 125 100 134 122 125 C 122 125 126 100 100 96 C 74 100 78 125 78 125" fill={colors.furWhite} />
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

          {/* Mouth and Tongue */}
          {renderMouthAndTongue()}
        </motion.g>
      </svg>
    </motion.div>
  );
}
