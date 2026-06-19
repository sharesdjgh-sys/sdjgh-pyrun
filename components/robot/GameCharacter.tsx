"use client";

import { motion, Variants } from "framer-motion";
import type { RobotState, RobotEmotion } from "@/types";

interface GameCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
}

// 게임 캐릭터 전사 모션 variants
const bodyVariants: Variants = {
  idle: { y: [0, -4, 0], transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } },
  talking: { y: [0, -2, 0], transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" } },
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
    rotate: [0, 8, -8, 8, -8, 0],
    scale: [1, 1.1, 1.1, 1.18, 1],
    y: [0, -10, -10, -5, 0],
    transition: { duration: 0.8, repeat: 3, ease: "easeInOut" },
  },
  error: { x: [0, -8, 8, -8, 8, 0], transition: { duration: 0.5, ease: "easeInOut" } },
};

const headVariants: Variants = {
  idle: { rotate: [0, 2, 0, -2, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  talking: { rotate: [0, 4, -4, 4, 0], transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" } },
  walking: {},
  jumping: { rotate: [0, -5, 0], transition: { duration: 0.3 } },
  celebrating: { rotate: [0, 10, -10, 10, 0], transition: { duration: 0.4, repeat: 4, ease: "easeInOut" } },
  error: { rotate: [-5, 5, -5, 0], transition: { duration: 0.4 } },
};

const swordVariants: Variants = {
  idle: { rotate: [0, 5, 0], transition: { duration: 2, repeat: Infinity } },
  talking: { rotate: [0, 40, -10, 40, 0], transition: { duration: 0.5, repeat: Infinity } },
  walking: { rotate: [-15, 15, -15], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-70, 30, 0], transition: { duration: 0.6 } },
  celebrating: {
    rotate: [0, -75, 45, -75, 45, 0],
    scale: [1, 1.2, 1],
    transition: { duration: 0.4, repeat: 3 },
  },
  error: { rotate: [-30], transition: { duration: 0.3 } },
};

const shieldVariants: Variants = {
  idle: { y: [0, -2, 0], transition: { duration: 2, repeat: Infinity } },
  talking: {},
  walking: { x: [-3, 3, -3], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { y: [-15], transition: { duration: 0.3 } },
  celebrating: { y: [-8, 8, -8], transition: { duration: 0.4, repeat: 3 } },
  error: { x: 28, y: -20, rotate: -25, transition: { duration: 0.4 } }, // 얼굴을 방패 뒤에 숨기는 연출
};

const legLVariants: Variants = {
  idle: {},
  talking: {},
  walking: { rotate: [-28, 28, -28], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [-15], transition: { duration: 0.3 } },
  celebrating: {},
  error: {},
};

const legRVariants: Variants = {
  idle: {},
  talking: {},
  walking: { rotate: [28, -28, 28], transition: { duration: 0.6, repeat: Infinity } },
  jumping: { rotate: [15], transition: { duration: 0.3 } },
  celebrating: {},
  error: {},
};

export default function GameCharacter({
  state,
  emotion = "idle",
  scale = 1.0,
  direction = "right",
  size = 184,
}: GameCharacterProps) {
  const isError = state === "error";

  const h = Math.round(size * (226 / 184));
  const directionScaleX = direction === "left" ? -1 : 1;

  // 감정 및 테마에 따른 기사 갑옷/투구 색상 지정
  const getColorPalette = () => {
    if (isError) {
      return {
        armor: "#EF4444",
        armorTrim: "#B91C1C",
        helmet: "#FCA5A5",
        shield: "#7F1D1D",
        cape: "#450A0A",
        hair: "#EF4444",
        skin: "#FFE4E6",
        eye: "#7F1D1D",
        mouth: "#7F1D1D",
        blade: "#EF4444",
        hilt: "#B91C1C",
      };
    }
    switch (emotion) {
      case "sad":
        return {
          armor: "#9CA3AF",
          armorTrim: "#4B5563",
          helmet: "#D1D5DB",
          shield: "#374151",
          cape: "#1F2937",
          hair: "#D1D5DB",
          skin: "#F9FAFB",
          eye: "#374151",
          mouth: "#374151",
          blade: "#D1D5DB",
          hilt: "#4B5563",
        };
      case "angry":
        return {
          armor: "#EF4444",
          armorTrim: "#B91C1C",
          helmet: "#F97316",
          shield: "#991B1B",
          cape: "#7F1D1D",
          hair: "#F59E0B",
          skin: "#FFF5F5",
          eye: "#7F1D1D",
          mouth: "#7F1D1D",
          blade: "#FCA5A5",
          hilt: "#B91C1C",
        };
      case "surprised":
        return {
          armor: "#3B82F6",
          armorTrim: "#1D4ED8",
          helmet: "#60A5FA",
          shield: "#1D4ED8",
          cape: "#1E3A8A",
          hair: "#FFE066",
          skin: "#FFFDF5",
          eye: "#1E3A8A",
          mouth: "#1E3A8A",
          blade: "#93C5FD",
          hilt: "#1D4ED8",
        };
      case "happy":
      case "idle":
      default:
        return {
          armor: "#A78BFA",
          armorTrim: "#7C3AED",
          helmet: "#C4B5FD",
          shield: "#7C3AED",
          cape: "#5B21B6",
          hair: "#FFB84D",
          skin: "#FFF9F2",
          eye: "#2D2621",
          mouth: "#2D2621",
          blade: "#ECE9FF",
          hilt: "#FFD700",
        };
    }
  };

  const colors = getColorPalette();

  const renderEyes = () => {
    if (isError) {
      return (
        <>
          <path d="M 72 90 L 82 96" stroke={colors.eye} strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 128 90 L 118 96" stroke={colors.eye} strokeWidth="3.5" strokeLinecap="round" />
        </>
      );
    }
    switch (emotion) {
      case "happy":
        return (
          <>
            <path d="M 68 96 Q 77 82 86 96" stroke={colors.eye} strokeWidth="4.5" fill="none" strokeLinecap="round" />
            <path d="M 114 96 Q 123 82 132 96" stroke={colors.eye} strokeWidth="4.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "sad":
        return (
          <>
            <ellipse cx="77" cy="94" rx="5" ry="7" fill={colors.eye} />
            <ellipse cx="123" cy="94" rx="5" ry="7" fill={colors.eye} />
            <path d="M 68 85 Q 77 89 86 85" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 114 85 Q 123 89 132 85" stroke="#9CA3AF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        );
      case "angry":
        return (
          <>
            <ellipse cx="77" cy="95" rx="5" ry="6" fill={colors.eye} />
            <ellipse cx="123" cy="95" rx="5" ry="6" fill={colors.eye} />
            <path d="M 66 84 L 86 92" stroke={colors.eye} strokeWidth="3.5" strokeLinecap="round" />
            <path d="M 134 84 L 114 92" stroke={colors.eye} strokeWidth="3.5" strokeLinecap="round" />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx="77" cy="94" r="8.5" fill={colors.eye} />
            <circle cx="123" cy="94" r="8.5" fill={colors.eye} />
            <circle cx="75" cy="91" r="3" fill="#FFFFFF" />
            <circle cx="121" cy="91" r="3" fill="#FFFFFF" />
          </>
        );
      default:
        return (
          <>
            <circle cx="77" cy="94" r="7" fill={colors.eye} />
            <circle cx="123" cy="94" r="7" fill={colors.eye} />
            <circle cx="75" cy="91" r="2.5" fill="#FFFFFF" />
            <circle cx="121" cy="91" r="2.5" fill="#FFFFFF" />
          </>
        );
    }
  };

  const renderMouth = () => {
    if (isError) {
      return <path d="M 94 116 Q 100 110 106 116" stroke={colors.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />;
    }
    switch (emotion) {
      case "happy":
        return <path d="M 92 110 Q 100 120 108 110" stroke={colors.mouth} strokeWidth="3.2" fill="none" strokeLinecap="round" />;
      case "sad":
        return <path d="M 93 116 Q 100 108 107 116" stroke={colors.mouth} strokeWidth="3" fill="none" strokeLinecap="round" />;
      case "angry":
        return <path d="M 92 113 L 108 113" stroke={colors.mouth} strokeWidth="3" strokeLinecap="round" />;
      case "surprised":
        return <circle cx="100" cy="113" r="4.5" stroke={colors.mouth} strokeWidth="2.5" fill="none" />;
      default:
        return <path d="M 94 110 Q 100 116 106 110" stroke={colors.mouth} strokeWidth="2.5" fill="none" strokeLinecap="round" />;
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
        <ellipse cx="100" cy="242" rx="46" ry="6" fill="#1C182A" opacity="0.22" />

        {/* Cape */}
        <path
          d="M 76 136 C 76 136 60 170 50 215 C 80 222 120 222 150 215 C 140 170 124 136 124 136 Z"
          fill={colors.cape}
        />

        {/* Left Foot */}
        <motion.g animate={state} variants={legLVariants} style={{ transformOrigin: "86px 190px" }}>
          <rect x="74" y="186" width="22" height="48" rx="8" fill={colors.armorTrim} />
          <rect x="64" y="222" width="36" height="18" rx="9" fill={colors.armor} />
        </motion.g>

        {/* Right Foot */}
        <motion.g animate={state} variants={legRVariants} style={{ transformOrigin: "114px 190px" }}>
          <rect x="104" y="186" width="22" height="48" rx="8" fill={colors.armorTrim} />
          <rect x="100" y="222" width="36" height="18" rx="9" fill={colors.armor} />
        </motion.g>

        {/* Golden Sword (Right hand weapon) */}
        <motion.g
          animate={state}
          variants={swordVariants}
          style={{ transformOrigin: "154px 148px" }}
        >
          {/* Blade */}
          <path d="M 148 140 L 158 140 L 158 50 L 153 38 L 148 50 Z" fill={colors.blade} />
          {/* Hilt / Crossguard */}
          <rect x="138" y="140" width="32" height="8" rx="3" fill={colors.hilt} />
          <rect x="150" y="148" width="8" height="20" rx="3.5" fill={colors.hilt} />
          {/* Red jewel on hilt */}
          <circle cx="154" cy="162" r="3.2" fill="#EF4444" />
        </motion.g>

        {/* Armor Body */}
        <g>
          <rect x="62" y="132" width="76" height="66" rx="22" fill={colors.armor} />
          {/* Breastplate crest */}
          <path d="M 86 132 C 86 132 100 156 114 132 L 100 180 Z" fill={colors.armorTrim} />
          <circle cx="100" cy="148" r="5" fill={colors.hilt} />
        </g>

        {/* Head + Helmet Group */}
        <motion.g animate={state} variants={headVariants} style={{ transformOrigin: "100px 96px" }}>
          {/* Hair block behind face */}
          <path d="M 52 82 C 52 82 48 128 100 128 C 152 128 148 82 148 82 Z" fill={colors.hair} />

          {/* Face */}
          <rect x="56" y="56" width="88" height="66" rx="28" fill={colors.skin} />

          {/* Eyes */}
          {renderEyes()}

          {/* Blush */}
          {!isError && (emotion === "happy" || emotion === "idle") && (
            <>
              <ellipse cx="66" cy="106" rx="8" ry="5.5" fill="#FFAAA6" opacity="0.8" />
              <ellipse cx="134" cy="106" rx="8" ry="5.5" fill="#FFAAA6" opacity="0.8" />
            </>
          )}

          {/* Mouth */}
          {renderMouth()}

          {/* Knight Helmet */}
          <path d="M 50 64 C 50 64 50 26 100 22 C 150 26 150 64 150 64 L 142 56 L 58 56 Z" fill={colors.helmet} />
          {/* Helmet plume (깃털 장식) */}
          <path
            d="M 100 22 Q 115 -10 135 6 Q 118 6 100 22"
            fill={isError ? "#B91C1C" : "#FF5F7E"}
            stroke={colors.armorTrim}
            strokeWidth="1.5"
          />
          {/* Helmet Visor visor outline */}
          <rect x="58" y="44" width="84" height="14" rx="4" fill={colors.armorTrim} opacity="0.85" />
          <line x1="72" y1="51" x2="128" y2="51" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
        </motion.g>

        {/* Shield (Left hand weapon) */}
        <motion.g
          animate={state}
          variants={shieldVariants}
          style={{ transformOrigin: "46px 158px" }}
        >
          {/* Knight Shield shape */}
          <path
            d="M 32 128 L 62 128 Q 66 168 47 190 Q 28 168 32 128 Z"
            fill={colors.shield}
            stroke={colors.armorTrim}
            strokeWidth="2.5"
          />
          {/* Golden cross on shield */}
          <path d="M 47 132 L 47 184 M 36 148 L 58 148" stroke={colors.hilt} strokeWidth="3" strokeLinecap="round" />
          <circle cx="47" cy="148" r="4.5" fill="#EF4444" />
        </motion.g>
      </svg>
    </motion.div>
  );
}
