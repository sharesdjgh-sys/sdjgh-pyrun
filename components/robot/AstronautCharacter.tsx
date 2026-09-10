"use client";

import { motion, useReducedMotion } from "framer-motion";
import CharacterCosmetics from "./CharacterCosmetics";
import { CompanionFrame, CompanionStar, useCompanionPaint, type CompanionProps } from "./CompanionParts";

/** A round alien in a bubble pod, with orbital feelers and three little feet. */
export default function AstronautCharacter(props: CompanionProps) {
  const { state, emotion = "idle", loadout } = props;
  const paint = useCompanionPaint();
  const reduced = useReducedMotion();
  const worried = state === "error" || emotion === "sad";
  return <CompanionFrame {...props} label="astronaut">
    <defs>
      <radialGradient id={paint.id("alien")} cx=".35" cy=".3" r=".85"><stop stopColor="#EAFFAD" /><stop offset=".55" stopColor="#BAE883" /><stop offset="1" stopColor="#64B9A1" /></radialGradient>
      <linearGradient id={paint.id("shell")} x2=".8" y2="1"><stop stopColor="#FFFEF0" /><stop offset=".55" stopColor="#F1E9D6" /><stop offset="1" stopColor="#C6CCD0" /></linearGradient>
      <radialGradient id={paint.id("space")} cx=".4" cy=".3" r=".8"><stop stopColor="#46677D" /><stop offset="1" stopColor="#263D5F" /></radialGradient>
      <linearGradient id={paint.id("orange")} x2="1" y2="1"><stop stopColor="#FFC77D" /><stop offset="1" stopColor="#E88E62" /></linearGradient>
      <linearGradient id={paint.id("glass")} x2="1" y2="1"><stop stopColor="#C8F9EF" stopOpacity=".28" /><stop offset="1" stopColor="#96D5F1" stopOpacity=".03" /></linearGradient>
    </defs>
    <CharacterCosmetics characterType="astronaut" loadout={loadout} layer="behind" />
    <rect x="28" y="136" width="29" height="61" rx="13" fill="#97ADC7" stroke="#627D9E" strokeWidth="2.5" />
    <rect x="143" y="136" width="29" height="61" rx="13" fill="#97ADC7" stroke="#627D9E" strokeWidth="2.5" />
    {[0, 1, 2].map((leg) => <motion.g key={leg} animate={state === "walking" && !reduced ? { y: leg === 1 ? [-5, 0, -5] : [0, -5, 0] } : { y: 0 }} transition={{ duration: .55, repeat: state === "walking" ? Infinity : 0 }}>
      <ellipse cx={63 + leg * 37} cy={leg === 1 ? 231 : 227} rx="18" ry="10" fill={paint.fill("orange")} stroke="#B87659" strokeWidth="2.5" />
      <path d={`M${56 + leg * 37} ${leg === 1 ? 228 : 224}h11`} stroke="#FFE4B0" strokeWidth="3" strokeLinecap="round" />
    </motion.g>)}
    <motion.g animate={state === "celebrating" && !reduced ? { rotate: [0, 22, 0] } : { rotate: 0 }} transition={{ duration: .75, repeat: state === "celebrating" ? 3 : 0 }} style={{ transformOrigin: "49px 173px" }}>
      <path d="M47 164q-21-12-28 3q-7 18 14 27l21-7Z" fill={paint.fill("shell")} stroke="#8FABB8" strokeWidth="2.5" />
      <ellipse cx="22" cy="177" rx="11" ry="13" fill={paint.fill("orange")} stroke="#B87659" strokeWidth="2" transform="rotate(-25 22 177)" />
    </motion.g>
    <path d="M153 164q21-12 28 3q7 18-14 27l-21-7Z" fill={paint.fill("shell")} stroke="#8FABB8" strokeWidth="2.5" />
    <ellipse cx="178" cy="177" rx="11" ry="13" fill={paint.fill("orange")} stroke="#B87659" strokeWidth="2" transform="rotate(25 178 177)" />
    <path d="M37 147q63-20 126 0l6 29q4 52-69 52q-73 0-69-52Z" fill={paint.fill("shell")} stroke="#8FABB8" strokeWidth="3" />
    <path d="M40 195q60 23 120 0" fill="none" stroke="#D7D7CB" strokeWidth="4" />
    <rect x="78" y="171" width="44" height="30" rx="11" fill="#46617F" stroke="#BBC6CD" strokeWidth="2" />
    <circle cx="89" cy="183" r="4" fill="#B9EC96" /><path d="M99 180h13m-13 6h8" stroke="#BCE1D9" strokeWidth="2" strokeLinecap="round" />
    <path d="M89 194h22" stroke="#E9B781" strokeWidth="2" strokeLinecap="round" />
    <path d="m51 185 4 4m90-4 4 4" stroke="#C8986B" strokeWidth="3" strokeLinecap="round" />
    <circle cx="100" cy="101" r="72" fill={paint.fill("shell")} stroke="#8FABB8" strokeWidth="3" />
    <circle cx="100" cy="101" r="63" fill={paint.fill("space")} stroke="#B2D5D5" strokeWidth="2" />
    <motion.g animate={!reduced ? { rotate: [0, -5, 0, 5, 0] } : { rotate: 0 }} transition={{ duration: 3.1, repeat: Infinity }} style={{ transformOrigin: "100px 88px" }}>
      <path d="M76 85q-1-22-15-22m63 22q1-22 15-22" fill="none" stroke="#B8E891" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="59" cy="62" rx="8" ry="6" fill="#D5F4A3" transform="rotate(25 59 62)" />
      <ellipse cx="141" cy="62" rx="8" ry="6" fill="#D5F4A3" transform="rotate(-25 141 62)" />
    </motion.g>
    <path d="M52 114q-2-33 23-37q24-7 50 0q25 4 23 37q-1 40-48 42q-47-2-48-42Z" fill={paint.fill("alien")} stroke="#7CBD91" strokeWidth="1.5" />
    <ellipse cx="64" cy="130" rx="9" ry="4" fill="#8ECDA4" /><ellipse cx="136" cy="130" rx="9" ry="4" fill="#8ECDA4" />
    {[77, 123].map((x) => <g key={x}>
      {worried ? <path d={`M${x - 7} 113q7-7 14 0`} stroke="#24445A" strokeWidth="4" fill="none" strokeLinecap="round" />
        : emotion === "happy" ? <path d={`M${x - 7} 109q7 13 14 0`} stroke="#24445A" strokeWidth="4" fill="none" strokeLinecap="round" />
        : <g><ellipse cx={x} cy="110" rx={emotion === "surprised" ? 12 : 10} ry={emotion === "surprised" ? 17 : 14} fill="#24445A" /><ellipse cx={x - 3} cy="105" rx="3" ry="4" fill="#ECFFF2" /></g>}
    </g>)}
    {emotion === "angry" && <path d="m68 93 16 7m32 0 16-7" stroke="#24445A" strokeWidth="3" strokeLinecap="round" />}
    {worried ? <path d="M95 139q5-5 10 0" stroke="#426F68" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      : <ellipse cx="100" cy="136" rx={emotion === "surprised" ? 6 : 4} ry={emotion === "happy" ? 5 : 3} fill="#426F68" />}
    <circle cx="95" cy="87" r="2.5" fill="#EEFFC4" /><circle cx="103" cy="85" r="3" fill="#EEFFC4" /><circle cx="112" cy="88" r="2" fill="#EEFFC4" />
    <circle cx="100" cy="101" r="63" fill={paint.fill("glass")} />
    <path d="M48 89q3-28 25-37" fill="none" stroke="#F0FFF8" strokeWidth="5" strokeLinecap="round" opacity=".75" />
    <path d="m47 99 1 7m98 28-7 7" stroke="#F0FFF8" strokeWidth="3" strokeLinecap="round" opacity=".65" />
    <rect x="25" y="93" width="13" height="26" rx="6" fill={paint.fill("orange")} stroke="#B87659" strokeWidth="2" />
    <rect x="162" y="93" width="13" height="26" rx="6" fill={paint.fill("orange")} stroke="#B87659" strokeWidth="2" />
    {!loadout?.head && <g>
      <path d="m132 37 9-14" stroke="#92A7BD" strokeWidth="4" strokeLinecap="round" />
      <circle cx="145" cy="18" r="9" fill="#B4E7E5" stroke="#7FAAB8" strokeWidth="2" />
      <ellipse cx="145" cy="18" rx="16" ry="4" fill="none" stroke="#EBC18C" strokeWidth="3" transform="rotate(-20 145 18)" />
    </g>}
    <CompanionStar x={56} y={175} size={6} fill="#EDC484" />
    <CharacterCosmetics characterType="astronaut" loadout={loadout} layer="front" />
  </CompanionFrame>;
}
