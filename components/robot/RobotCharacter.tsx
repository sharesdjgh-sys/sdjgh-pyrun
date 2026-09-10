"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import type { RobotState, RobotEmotion } from "@/types";
import {
  bodyVariants,
  headVariants,
  leftArmVariants,
  rightArmVariants,
  leftLegVariants,
  rightLegVariants,
} from "@/components/robot/robotAnimations";
import CharacterCosmetics from "./CharacterCosmetics";
import type { CharacterLoadout } from "@/types";

interface RobotCharacterProps {
  state: RobotState;
  emotion?: RobotEmotion;
  scale?: number;
  direction?: "left" | "right";
  size?: number;
  loadout?: CharacterLoadout;
}

const getColorPalette = (emotion: RobotEmotion, isError: boolean) => {
  if (isError) {
    return {
      bodyBg: "#FEF2F2",
      bodyStroke: "#FCA5A5",
      accent: "#EF4444",
      accentDark: "#DC2626",
      earBg: "#EF4444",
      eyeBg: "#4A0E0E",
      cheekBg: "#FFA3A3",
      glowColor: "#EF4444",
    };
  }

  switch (emotion) {
    case "sad":
      return {
        bodyBg: "#F9FAFB",
        bodyStroke: "#E5E7EB",
        accent: "#9CA3AF",
        accentDark: "#4B5563",
        earBg: "#6B7280",
        eyeBg: "#374151",
        cheekBg: "transparent",
        glowColor: "#9CA3AF",
      };
    case "angry":
      return {
        bodyBg: "#FFF5F5",
        bodyStroke: "#FED7D7",
        accent: "#F56565",
        accentDark: "#C53030",
        earBg: "#E53E3E",
        eyeBg: "#742A2A",
        cheekBg: "#FEB2B2",
        glowColor: "#EF4444",
      };
    case "surprised":
      return {
        bodyBg: "#FFFDF5",
        bodyStroke: "#FEF3C7",
        accent: "#F59E0B",
        accentDark: "#D97706",
        earBg: "#F59E0B",
        eyeBg: "#451A03",
        cheekBg: "#FCD34D",
        glowColor: "#F59E0B",
      };
    case "happy":
    default:
      return {
        bodyBg: "#FCF9FF",
        bodyStroke: "#BDA8D4",
        accent: "#C6A2EC",
        accentDark: "#A07BC7",
        earBg: "#D0B6F2",
        eyeBg: "#2B2440",
        cheekBg: "#F4A6C2",
        glowColor: "#A78BFA",
      };
  }
};

export default function RobotCharacter({
  state,
  emotion = "idle",
  scale = 1.0,
  direction = "right",
  size = 184,
  loadout,
}: RobotCharacterProps) {
  const isError = state === "error";
  const colors = getColorPalette(emotion, isError);
  const shellShade = isError || emotion === "angry" ? "#F7DDE2"
    : emotion === "sad" ? "#E4E6EB" : emotion === "surprised" ? "#F7ECCF" : "#E4D7EE";
  // Every wardrobe thumbnail and stage clone owns its SVG paint servers.
  const paintId = useId().replace(/:/g, "");
  const paint = (name: string) => `url(#${paintId}-${name})`;

  const h = Math.round(size * (226 / 184));

  // 방향에 따른 가로 뒤집기 적용 (left일 때 scaleX: -1)
  const directionScaleX = direction === "left" ? -1 : 1;

  const renderEyes = () => {
    if (isError) {
      return (
        <>
          <ellipse cx="78" cy="96" rx="15" ry="18" fill={colors.eyeBg} />
          <ellipse cx="122" cy="96" rx="15" ry="18" fill={colors.eyeBg} />
          <circle cx="73" cy="88" r="5" fill="#FFFFFF" />
          <circle cx="117" cy="88" r="5" fill="#FFFFFF" />
        </>
      );
    }

    switch (emotion) {
      case "happy":
        return (
          <>
            <path
              d="M 64 100 Q 78 84 92 100"
              stroke={colors.eyeBg}
              strokeWidth="5.5"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 108 100 Q 122 84 136 100"
              stroke={colors.eyeBg}
              strokeWidth="5.5"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "sad":
        return (
          <>
            <circle cx="78" cy="98" r="6.5" fill={colors.eyeBg} />
            <circle cx="122" cy="98" r="6.5" fill={colors.eyeBg} />
          </>
        );
      case "angry":
        return (
          <>
            <path d="M 63 86 L 93 96 L 93 106 L 63 96 Z" fill={colors.eyeBg} />
            <path d="M 137 86 L 107 96 L 107 106 L 137 96 Z" fill={colors.eyeBg} />
            <circle cx="78" cy="98" r="4.5" fill="#FFFFFF" />
            <circle cx="122" cy="98" r="4.5" fill="#FFFFFF" />
          </>
        );
      case "surprised":
        return (
          <>
            <circle cx="78" cy="96" r="17" fill={colors.eyeBg} />
            <circle cx="122" cy="96" r="17" fill={colors.eyeBg} />
            <circle cx="74" cy="88" r="6" fill="#FFFFFF" />
            <circle cx="118" cy="88" r="6" fill="#FFFFFF" />
            <circle cx="82" cy="102" r="3" fill="#FFFFFF" opacity="0.6" />
            <circle cx="126" cy="102" r="3" fill="#FFFFFF" opacity="0.6" />
          </>
        );
      case "idle":
      default:
        return (
          <>
            <ellipse cx="78" cy="96" rx="15" ry="18" fill={paint("eyes")} />
            <ellipse cx="122" cy="96" rx="15" ry="18" fill={paint("eyes")} />
            <path d="M70 106q8 7 16 0m28 0q8 7 16 0" stroke={colors.accent} strokeWidth="2" opacity=".5" fill="none" strokeLinecap="round" />
            <circle cx="73" cy="88" r="5" fill="#FFFFFF" />
            <circle cx="117" cy="88" r="5" fill="#FFFFFF" />
            <circle cx="83" cy="103" r="2.4" fill="#FFFFFF" opacity="0.55" />
            <circle cx="127" cy="103" r="2.4" fill="#FFFFFF" opacity="0.55" />
          </>
        );
    }
  };

  const renderMouth = () => {
    if (isError) {
      return (
        <path
          d="M92 117q8 -6 16 0"
          stroke="#3A2E4A"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      );
    }

    switch (emotion) {
      case "sad":
        return (
          <path
            d="M92 118q8 -8 16 0"
            stroke="#3A2E4A"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "angry":
        return (
          <path
            d="M92 116 l8 -4 l8 4"
            stroke="#3A2E4A"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        );
      case "surprised":
        return <circle cx="100" cy="115" r="7.5" stroke="#3A2E4A" strokeWidth="3" fill="none" />;
      case "happy":
        return <g><path d="M90 113q10 5 20 0q-1 13-10 13t-10-13" fill="#5C3F71" /><path d="M94 122q6-5 12 0q-6 5-12 0" fill="#EEAAC8" /></g>;
      case "idle":
      default:
        return (
          <path
            d="M92 113q8 8 16 0"
            stroke="#3A2E4A"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        );
    }
  };

  const renderEyebrows = () => {
    if (isError) {
      return (
        <>
          <path
            d="M69 76q9 4.5 18 -1.5"
            stroke="#C49BE8"
            strokeWidth="3.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M113 74.5q9 -4.5 18 1.5"
            stroke="#C49BE8"
            strokeWidth="3.6"
            fill="none"
            strokeLinecap="round"
          />
        </>
      );
    }

    switch (emotion) {
      case "angry":
        return (
          <>
            <path d="M66 73 L 88 83" stroke="#742A2A" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M134 73 L 112 83" stroke="#742A2A" strokeWidth="4" fill="none" strokeLinecap="round" />
          </>
        );
      case "sad":
        return (
          <>
            <path
              d="M68 76 Q 78 68 88 78"
              stroke="#9CA3AF"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M112 78 Q 122 68 132 76"
              stroke="#9CA3AF"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "surprised":
        return (
          <>
            <path
              d="M66 65q9 -4 18 0"
              stroke="#D97706"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M116 65q9 -4 18 0"
              stroke="#D97706"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
      case "happy":
      case "idle":
      default:
        return (
          <>
            <path
              d="M69 73q9 -6 18 -1.5"
              stroke="#C49BE8"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M113 71.5q9 -4.5 18 1.5"
              stroke="#C49BE8"
              strokeWidth="3.6"
              fill="none"
              strokeLinecap="round"
            />
          </>
        );
    }
  };

  return (
    <div
      data-character="robot"
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
          <linearGradient id={`${paintId}-shell`} x1=".15" y1="0" x2=".75" y2="1">
            <stop stopColor="#FFFFFF" /><stop offset=".52" stopColor={colors.bodyBg} /><stop offset="1" stopColor={shellShade} />
          </linearGradient>
          <linearGradient id={`${paintId}-lavender`} x1=".15" y1="0" x2=".85" y2="1">
            <stop stopColor={colors.earBg} /><stop offset=".4" stopColor={colors.accent} /><stop offset="1" stopColor={colors.accentDark} />
          </linearGradient>
          <linearGradient id={`${paintId}-face`} x2=".3" y2="1">
            <stop stopColor="#FFFFFF" /><stop offset=".7" stopColor="#FFFFFF" /><stop offset="1" stopColor={colors.bodyBg} />
          </linearGradient>
          <linearGradient id={`${paintId}-eyes`} x2=".2" y2="1">
            <stop stopColor={colors.eyeBg} /><stop offset=".6" stopColor={colors.eyeBg} /><stop offset="1" stopColor={colors.accentDark} />
          </linearGradient>
          <radialGradient id={`${paintId}-light`} cx=".35" cy=".25" r=".8">
            <stop stopColor="#F9F1FF" /><stop offset=".35" stopColor={colors.accent} /><stop offset="1" stopColor={colors.glowColor} />
          </radialGradient>
        </defs>
        {/* Size is rendered as SVG dimensions; movement cannot overwrite it. */}
        <motion.g data-part="character-body" animate={state} variants={bodyVariants} style={{ transformOrigin: "100px 250px" }}>
        <CharacterCosmetics characterType="robot" loadout={loadout} layer="behind" />
        {/* Shadow */}
        <ellipse cx="100" cy="245" rx="54" ry="7" fill={colors.accentDark} opacity="0.16" />

        {/* Left Leg */}
        <motion.g data-part="left-leg" animate={state} variants={leftLegVariants} style={{ originX: "89px", originY: "196px", transformBox: "view-box" }}>
          <rect x="78" y="196" width="22" height="34" rx="11" fill={paint("shell")} stroke={colors.bodyStroke} strokeWidth="1.3" />
          <rect
            x="62"
            y="222"
            width="36"
            height="22"
            rx="11"
            fill={paint("shell")}
            stroke={colors.bodyStroke}
            strokeWidth="2"
          />
          <rect x="62" y="235" width="36" height="9" rx="4.5" fill={colors.accent} />
          <path d="M70 228h13" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </motion.g>

        {/* Right Leg */}
        <motion.g data-part="right-leg" animate={state} variants={rightLegVariants} style={{ originX: "111px", originY: "196px", transformBox: "view-box" }}>
          <rect x="100" y="196" width="22" height="34" rx="11" fill={paint("shell")} stroke={colors.bodyStroke} strokeWidth="1.3" />
          <rect
            x="102"
            y="222"
            width="36"
            height="22"
            rx="11"
            fill={paint("shell")}
            stroke={colors.bodyStroke}
            strokeWidth="2"
          />
          <rect x="102" y="235" width="36" height="9" rx="4.5" fill={colors.accent} />
          <path d="M110 228h13" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
        </motion.g>

        {/* Left Arm */}
        <motion.g animate={state} variants={leftArmVariants} style={{ originX: "56px", originY: "162px", transformBox: "view-box" }}>
          <rect x="42" y="160" width="20" height="32" rx="10" fill={paint("shell")} stroke={colors.bodyStroke} strokeWidth="1.3" />
          <ellipse cx="55" cy="161" rx="15" ry="13" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.5" />
          <circle cx="49" cy="196" r="13" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.5" />
          <circle cx="39" cy="190" r="6" fill={colors.accent} />
          <ellipse cx="46" cy="192" rx="4" ry="3" fill="#FFFFFF" opacity="0.45" />
          <path d="m49 200 1 4m5-5 1 3" stroke={colors.accentDark} strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Right Arm */}
        <motion.g animate={state} variants={rightArmVariants} style={{ originX: "144px", originY: "162px", transformBox: "view-box" }}>
          <rect x="138" y="160" width="20" height="32" rx="10" fill={paint("shell")} stroke={colors.bodyStroke} strokeWidth="1.3" />
          <ellipse cx="145" cy="161" rx="15" ry="13" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.5" />
          <circle cx="151" cy="196" r="13" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.5" />
          <circle cx="161" cy="190" r="6" fill={colors.accent} />
          <ellipse cx="148" cy="192" rx="4" ry="3" fill="#FFFFFF" opacity="0.45" />
          <path d="m151 200 1 4m5-5 1 3" stroke={colors.accentDark} strokeWidth="1.5" strokeLinecap="round" />
        </motion.g>

        {/* Body */}
        <g>
          <rect
            x="54"
            y="150"
            width="92"
            height="74"
            rx="36"
            fill={paint("shell")}
            stroke={colors.bodyStroke}
            strokeWidth="2"
          />
          <ellipse cx="80" cy="166" rx="22" ry="11" fill="#FFFFFF" opacity="0.7" />
          <path d="M65 162q7-7 18-7" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          <text
            x="100"
            y="186"
            textAnchor="middle"
            fontFamily="'Jua', sans-serif"
            fontSize="30"
            fill={colors.accentDark}
            letterSpacing="1"
          >
            AI
          </text>
          <rect x="58" y="196" width="84" height="15" rx="7.5" fill={paint("lavender")} />
          <path d="M67 198h65" stroke="#EEE1FB" strokeWidth="1.5" strokeLinecap="round" opacity=".65" />
          {[70, 82, 94, 106, 118, 130].map((cx) => (
            <circle key={cx} cx={cx} cy="203.5" r="2.1" fill={colors.bodyBg} />
          ))}
        </g>

        {/* Head + Headphones + Antenna + Bow (grouped so they all move together) */}
        <motion.g data-part="character-head" animate={state} variants={headVariants} style={{ originX: "100px", originY: "95px", transformBox: "view-box" }}>
          {/* Headphones */}
          <circle cx="35" cy="96" r="20" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="2" />
          <ellipse cx="35" cy="96" rx="8.5" ry="13" fill={paint("shell")} stroke={colors.accentDark} strokeWidth="1.5" />
          <circle cx="165" cy="96" r="20" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="2" />
          <ellipse cx="165" cy="96" rx="8.5" ry="13" fill={paint("shell")} stroke={colors.accentDark} strokeWidth="1.5" />
          <path d="M22 85q3-5 8-6m142 0q5 1 7 6" stroke="#F5ECFF" strokeWidth="2.5" strokeLinecap="round" opacity=".8" />

          {/* Head */}
          <rect
            x="28"
            y="40"
            width="144"
            height="110"
            rx="50"
            fill={paint("shell")}
            stroke={colors.bodyStroke}
            strokeWidth="2.5"
          />
          <ellipse cx="70" cy="66" rx="34" ry="16" fill="#FFFFFF" opacity="0.65" />
          <path d="M42 70q7-17 25-20" fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" opacity=".9" />
          <path d="M51 136q49 19 98 0" stroke={colors.bodyStroke} strokeWidth="2" fill="none" opacity=".45" strokeLinecap="round" />
          <rect x="43" y="60" width="114" height="73" rx="33" fill={colors.bodyStroke} opacity=".3" />
          <rect x="44" y="59" width="112" height="70" rx="32" fill={paint("face")} stroke={colors.bodyStroke} strokeWidth="2" />

          {/* Eyebrows */}
          {renderEyebrows()}

          {/* Cheeks */}
          {colors.cheekBg !== "transparent" && (
            <>
              <ellipse cx="59" cy="113" rx="11" ry="7.5" fill={colors.cheekBg} opacity="0.8" />
              <ellipse cx="141" cy="113" rx="11" ry="7.5" fill={colors.cheekBg} opacity="0.8" />
            </>
          )}

          {/* Eyes */}
          <g style={{ transformOrigin: "100px 96px", animation: "blinkEye 4.6s ease-in-out infinite" }}>
            {renderEyes()}
          </g>

          {/* Mouth */}
          {renderMouth()}

          {/* Tears (Sad state) */}
          {!isError && emotion === "sad" && (
            <g>
              {/* Left Tear */}
              <motion.path
                d="M 74 110 L 76 114 L 72 114 Z"
                fill="#3B82F6"
                variants={{
                  idle: { y: [0, 8, 16], opacity: [0, 1, 0] },
                  talking: { y: [0, 8, 16], opacity: [0, 1, 0] },
                }}
                animate="idle"
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              {/* Right Tear */}
              <motion.path
                d="M 126 110 L 128 114 L 124 114 Z"
                fill="#3B82F6"
                variants={{
                  idle: { y: [0, 8, 16], opacity: [0, 1, 0] },
                  talking: { y: [0, 8, 16], opacity: [0, 1, 0] },
                }}
                animate="idle"
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }}
              />
            </g>
          )}

          {/* Anger Spark (Angry state) */}
          {!isError && emotion === "angry" && (
            <motion.g
              style={{ originX: "155px", originY: "35px", transformBox: "view-box" }}
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            >
              {/* 💢 icon SVG representation */}
              <path
                d="M 148 30 L 162 30 M 155 23 L 155 37 M 149 24 Q 155 30 161 24 M 149 36 Q 155 30 161 36"
                stroke="#EF4444"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
              />
            </motion.g>
          )}

          {/* Surprise exclamation mark (Surprised state) */}
          {!isError && emotion === "surprised" && (
            <motion.g
              style={{ originX: "100px", originY: "10px", transformBox: "view-box" }}
              animate={{ y: [0, -8, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* ❗ icon SVG */}
              <rect x="97" y="-12" width="6" height="15" rx="3" fill="#F59E0B" />
              <circle cx="100" cy="8" r="3.5" fill="#F59E0B" />
            </motion.g>
          )}

          {/* Antenna */}
          {!loadout?.head && <>
          <line x1="100" y1="36" x2="100" y2="14" stroke={colors.bodyStroke} strokeWidth="5" strokeLinecap="round" />
          <circle
            cx="100"
            cy="9"
            r="9"
            fill={paint("light")}
            stroke={colors.accentDark}
            strokeWidth="1.5"
            style={{ transformOrigin: "100px 9px", animation: "antGlow 1.9s ease-in-out infinite" }}
          />
          <circle cx="97" cy="6" r="2.5" fill="#FFFFFF" opacity=".85" />

          {/* Hair Bow */}
          <g style={{ transformOrigin: "64px 40px", animation: "bowSway 3.6s ease-in-out infinite" }}>
            <ellipse cx="50" cy="40" rx="12" ry="9.5" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.3" />
            <ellipse cx="79" cy="39" rx="12" ry="9.5" fill={paint("lavender")} stroke={colors.accentDark} strokeWidth="1.3" />
            <path d="m55 39 7 2m8 0 5-3" stroke={colors.accentDark} strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
            <ellipse cx="48" cy="38" rx="5" ry="3.5" fill="#FFFFFF" opacity="0.35" />
            <circle cx="64" cy="40" r="7.5" fill={colors.accentDark} />
          </g>
          </>}
        <CharacterCosmetics characterType="robot" loadout={loadout} layer="front" slots={["head", "face"]} />
        </motion.g>
        <CharacterCosmetics characterType="robot" loadout={loadout} layer="front" slots={["body"]} />
        </motion.g>
      </svg>
    </div>
  );
}
