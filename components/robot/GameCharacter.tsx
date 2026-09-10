"use client";

import { motion, useReducedMotion } from "framer-motion";
import CharacterCosmetics from "./CharacterCosmetics";
import { CompanionFrame, CompanionStar, useCompanionPaint, type CompanionProps } from "./CompanionParts";

/** A boy stone guardian: chunky mineral body, ember eyes, oversized gauntlets. */
export default function GameCharacter(props: CompanionProps) {
  const { state, emotion = "idle", loadout } = props;
  const paint = useCompanionPaint();
  const reduced = useReducedMotion();
  const worried = state === "error" || emotion === "sad";
  return <CompanionFrame {...props} label="game">
    <defs>
      <linearGradient id={paint.id("stone")} x2=".8" y2="1"><stop stopColor="#BBDBCF" /><stop offset=".5" stopColor="#81AEA8" /><stop offset="1" stopColor="#4E7B81" /></linearGradient>
      <linearGradient id={paint.id("edge")} x2=".6" y2="1"><stop stopColor="#E1EFE0" /><stop offset="1" stopColor="#90B8AC" /></linearGradient>
      <linearGradient id={paint.id("scarf")} x2="1" y2="1"><stop stopColor="#FFBB65" /><stop offset="1" stopColor="#D66D4B" /></linearGradient>
      <linearGradient id={paint.id("crystal")} x2=".8" y2="1"><stop stopColor="#FFF5B7" /><stop offset=".5" stopColor="#FFCB68" /><stop offset="1" stopColor="#E88143" /></linearGradient>
    </defs>
    <CharacterCosmetics characterType="game" loadout={loadout} layer="behind" />
    <motion.path d="M123 151q17 1 32 14l-8 41-12-11-10 9-8-37Z" fill={paint.fill("scarf")} stroke="#B75E44" strokeWidth="2.5"
      animate={!reduced ? { rotate: [0, -5, 0, 3, 0] } : { rotate: 0 }} transition={{ duration: 2.5, repeat: Infinity }} style={{ transformOrigin: "123px 153px" }} />
    {[0, 1].map((leg) => <motion.g key={leg} animate={state === "walking" && !reduced ? { y: leg ? [0, -7, 0] : [-7, 0, -7] } : { y: 0 }} transition={{ duration: .55, repeat: state === "walking" ? Infinity : 0 }}>
      <path d={`M${58 + leg * 46} 201h34l5 28-8 8H${52 + leg * 46}l-4-13Z`} fill={paint.fill("stone")} stroke="#416871" strokeWidth="3" strokeLinejoin="round" />
      <path d={`m${55 + leg * 46} 221 7-12h21l5 12Z`} fill="#B7D4C4" />
      <path d={`M${58 + leg * 46} 228v7m10-7v7`} stroke="#416871" strokeWidth="2" />
    </motion.g>)}
    <path d="m62 144 37-8 39 8 9 39-16 29H68l-17-29Z" fill={paint.fill("stone")} stroke="#416871" strokeWidth="3" strokeLinejoin="round" />
    <path d="m69 160 29-8 33 8-7 32H77Z" fill={paint.fill("edge")} />
    <path d="m99 166 13 15-13 16-13-16Z" fill={paint.fill("crystal")} stroke="#F8E7BA" strokeWidth="3" />
    <path d="m71 199 9-5 7 8m36-49-5 10 6 9" stroke="#4D7C7C" strokeWidth="2" fill="none" strokeLinejoin="round" />
    <motion.g animate={state === "celebrating" && !reduced ? { y: [0, -20, 0], rotate: [0, -12, 0] } : { y: 0, rotate: 0 }} transition={{ duration: .65, repeat: state === "celebrating" ? 3 : 0 }} style={{ transformOrigin: "148px 166px" }}>
      <path d="m142 153 23 5 12 24-8 23-29 3-14-18 4-24Z" fill={paint.fill("stone")} stroke="#416871" strokeWidth="3" strokeLinejoin="round" />
      <path d="m139 172 22-3 9 16-7 11-25 1-6-13Z" fill={paint.fill("edge")} />
      <path d="m149 177 2 12m8-14 3 12" stroke="#5C8887" strokeWidth="2.5" strokeLinecap="round" />
    </motion.g>
    <path d="m51 155-20 6-10 24 13 22 24-3 12-23Z" fill={paint.fill("stone")} stroke="#416871" strokeWidth="3" strokeLinejoin="round" />
    <motion.g animate={worried && !reduced ? { y: -9, rotate: -6 } : { y: 0, rotate: 0 }} style={{ transformOrigin: "41px 184px" }}>
      <path d="m19 168 24-8 25 8-3 28-22 21-21-21Z" fill="#586979" stroke="#364F61" strokeWidth="3" strokeLinejoin="round" />
      <path d="m26 173 17-6 18 6-3 19-15 15-14-15Z" fill="#F1C17C" stroke="#FFE8B6" strokeWidth="2" />
      <CompanionStar x={43} y={184} size={11} fill="#FFF3CC" />
    </motion.g>
    <path d="M52 142q45-13 94 0l-6 17q-44 12-82-1Z" fill={paint.fill("scarf")} stroke="#B9694A" strokeWidth="2.5" />
    <path d="m53 144 42 6 9 12-10 13-15-17-23-1Z" fill="#FFD485" />
    <path d="m45 58 24-14h62l25 16 7 55-14 30-31 9H73l-29-13-9-31Z" fill={paint.fill("stone")} stroke="#416871" strokeWidth="3.5" strokeLinejoin="round" />
    <path d="m45 61 24-13h58l25 15-13 8H58Z" fill={paint.fill("edge")} />
    <path d="m43 80 10-9h20l-4 11-11 6-2 14-14-4m109 22-12 8 4 11" fill="none" stroke="#416871" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="m54 94 18-9h55l19 10-4 31-23 13H77l-22-12Z" fill="#28494F" stroke="#527D79" strokeWidth="2" strokeLinejoin="round" />
    {[77, 123].map((x) => <g key={x}>
      {emotion === "happy" && !worried
        ? <path d={`M${x - 9} 114q9-15 18 0`} fill="none" stroke="#FFD879" strokeWidth="6" strokeLinecap="round" />
        : <rect x={x - 8} y={worried ? 108 : 101} width="16" height={emotion === "surprised" ? 23 : worried ? 9 : 19} rx="5" fill={paint.fill("crystal")} />}
      {!worried && emotion !== "happy" && <rect x={x - 5} y="103" width="5" height="5" rx="2" fill="#FFF8D7" />}
    </g>)}
    <path d={worried ? "M65 93l18-7m34 0 18 7" : "M64 87l21 6m29 0 21-6"} stroke="#D1E3CC" strokeWidth={emotion === "angry" ? 8 : 6} strokeLinecap="round" />
    {worried ? <path d="M94 130q6-6 12 0" stroke="#F5C472" strokeWidth="3" fill="none" strokeLinecap="round" />
      : emotion === "surprised" ? <rect x="96" y="125" width="8" height="10" rx="4" fill="#F5C472" />
      : <path d={emotion === "angry" ? "M94 130h12" : "m91 127 8 5 11-7"} stroke="#F5C472" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
    {!loadout?.head && <g>
      <path d="m78 46 1-22 15 9 7-18 11 19 13-7-4 19Z" fill={paint.fill("crystal")} stroke="#C38B50" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m101 21 2 20" stroke="#FFF5B6" strokeWidth="3" strokeLinecap="round" />
    </g>}
    {state === "error" && <path d="M152 80q-7 10 0 13q7-3 0-13Z" fill="#BCEFF5" />}
    <CharacterCosmetics characterType="game" loadout={loadout} layer="front" />
  </CompanionFrame>;
}
