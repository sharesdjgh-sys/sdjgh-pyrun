"use client";

import { motion, useReducedMotion } from "framer-motion";
import CharacterCosmetics from "./CharacterCosmetics";
import { CompanionFrame, CompanionStar, useCompanionPaint, type CompanionProps } from "./CompanionParts";

/** A girl moon-cat witch: pointed ears, feline eyes, tiny paws and a curled tail. */
export default function WizardCharacter(props: CompanionProps) {
  const { state, emotion = "idle", loadout } = props;
  const paint = useCompanionPaint();
  const reduced = useReducedMotion();
  const worried = state === "error" || emotion === "sad";
  return <CompanionFrame {...props} label="wizard">
    <defs>
      <linearGradient id={paint.id("fur")} x2=".6" y2="1"><stop stopColor="#AC9ADF" /><stop offset=".6" stopColor="#8272BA" /><stop offset="1" stopColor="#665398" /></linearGradient>
      <linearGradient id={paint.id("hat")} x2="1" y2="1"><stop stopColor="#6E59A4" /><stop offset="1" stopColor="#362E65" /></linearGradient>
      <linearGradient id={paint.id("iris")} x2=".2" y2="1"><stop stopColor="#B5F1C5" /><stop offset="1" stopColor="#52BAAF" /></linearGradient>
      <linearGradient id={paint.id("moon")} x2="1" y2="1"><stop stopColor="#FFF5B7" /><stop offset="1" stopColor="#EEC184" /></linearGradient>
    </defs>
    <CharacterCosmetics characterType="wizard" loadout={loadout} layer="behind" />
    <motion.g animate={!reduced ? { rotate: [0, -8, 0, 4, 0] } : { rotate: 0 }} transition={{ duration: 3, repeat: Infinity }} style={{ transformOrigin: "124px 199px" }}>
      <path d="M126 199q52 22 48-19q-3-17-17-11q-10 5-2 13" fill="none" stroke="#57457D" strokeWidth="17" strokeLinecap="round" />
      <path d="M126 199q52 22 48-19q-3-17-17-11q-10 5-2 13" fill="none" stroke="#9783CA" strokeWidth="12" strokeLinecap="round" />
      <path d="M169 167q-12-5-17 5" fill="none" stroke="#D1BAE9" strokeWidth="10" strokeLinecap="round" />
    </motion.g>
    {[0, 1].map((leg) => <motion.g key={leg} animate={state === "walking" && !reduced ? { y: leg ? [0, -5, 0] : [-5, 0, -5] } : { y: 0 }} transition={{ duration: .5, repeat: state === "walking" ? Infinity : 0 }}>
      <ellipse cx={79 + leg * 39} cy="222" rx="17" ry="13" fill={paint.fill("fur")} stroke="#67518B" strokeWidth="2.5" />
      <path d={`M${72 + leg * 39} 222v7m7-7v8`} stroke="#D4C2ED" strokeWidth="2" strokeLinecap="round" />
    </motion.g>)}
    <path d="M75 150q25-12 50 0l17 63-16 5-12-5-14 7-13-7-12 5-18-5Z" fill={paint.fill("hat")} stroke="#4D3C72" strokeWidth="2.5" strokeLinejoin="round" />
    <path d="M100 166v43m-36 0 12 3 10-5 14 7 13-7 12 5 10-3" stroke="#B59BCE" strokeWidth="2" fill="none" />
    <path d="m65 154 35 18 35-18-13-12H78Z" fill="#C7B0E4" stroke="#8066A5" strokeWidth="2" />
    <path d="m96 165 4-7 5 7-5 10Z" fill={paint.fill("moon")} />
    <path d="M70 164q-16-6-27 21l15 13 23-26m49-8q15-3 26 18l-14 15-20-25" fill={paint.fill("hat")} stroke="#4D3C72" strokeWidth="2.5" strokeLinejoin="round" />
    <ellipse cx="49" cy="191" rx="12" ry="10" fill={paint.fill("fur")} stroke="#67518B" strokeWidth="2" />
    <ellipse cx="147" cy="190" rx="11" ry="10" fill={paint.fill("fur")} stroke="#67518B" strokeWidth="2" />
    <path d="M41 93 35 41q1-9 9-4l33 28q22-10 46 0l33-28q8-5 9 4l-6 52 6 28-12 2 7 13-20 3q-39 28-80 0l-20-3 7-13-12-2Z" fill={paint.fill("fur")} stroke="#67518B" strokeWidth="3" strokeLinejoin="round" />
    <path d="m44 49 6 35 19-13Z" fill="#E1A7C9" /><path d="m156 49-6 35-19-13Z" fill="#E1A7C9" />
    <path d="M56 107q22-8 44 7q22-15 44-7q8 21-8 31q-36 21-72 0q-16-10-8-31Z" fill="#E5D7EE" />
    {[77, 123].map((x) => <g key={x}>
      {emotion === "happy" && !worried ? <path d={`M${x - 13} 108q13-17 26 0`} stroke="#352C57" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        : <g>
          <ellipse cx={x} cy="107" rx={emotion === "surprised" ? 15 : 14} ry={worried ? 10 : 17} fill={paint.fill("iris")} stroke="#352C57" strokeWidth="2.5" />
          <ellipse cx={x} cy="108" rx={emotion === "surprised" ? 7 : 4} ry={worried ? 8 : 13} fill="#352C57" />
          <circle cx={x - 4} cy="101" r="4" fill="#F1FFF1" />
        </g>}
      <path d={x === 77 ? "M64 99l-6-5m8 3-2-7" : "M136 99l6-5m-8 3 2-7"} stroke="#352C57" strokeWidth="2.5" strokeLinecap="round" />
    </g>)}
    {worried && <path d="m64 87 17-5m38 0 17 5" stroke="#4E3F70" strokeWidth="3" strokeLinecap="round" />}
    {emotion === "angry" && <path d="m63 86 19 8m36 0 19-8" stroke="#4E3F70" strokeWidth="4" strokeLinecap="round" />}
    <path d="m95 119 5 5 5-5q-5-4-10 0Z" fill="#AA6E9E" />
    {worried ? <path d="m94 131 6-4 6 4" fill="none" stroke="#5A426F" strokeWidth="2.5" strokeLinecap="round" />
      : emotion === "surprised" ? <ellipse cx="100" cy="133" rx="4" ry="6" fill="#5A426F" />
      : <path d="M100 124v3q-7 10-13 0m13 0q7 10 13 0" fill="none" stroke="#5A426F" strokeWidth="2.5" strokeLinecap="round" />}
    <path d="m42 113 17 4m-18 4 16 1m101-9-17 4m18 4-16 1" stroke="#CAB5E3" strokeWidth="2" strokeLinecap="round" />
    <path d="M104 76q-12 0-11 9q2 10 12 7q-9-2-1-16Z" fill="#F5D994" />
    {!loadout?.head && <g transform="rotate(12 116 63)">
      <path d="m83 56 14-43q3-12 16-8l25 8-19 6 19 38Z" fill={paint.fill("hat")} stroke="#4D3C72" strokeWidth="2.5" strokeLinejoin="round" />
      <path d="m87 43 44 1 5 12-53-1Z" fill="#D7A0CA" />
      <ellipse cx="112" cy="60" rx="52" ry="11" fill={paint.fill("hat")} stroke="#4D3C72" strokeWidth="2.5" />
      <path d="m122 45 13-7-1 16-12-5-11 7-1-16Z" fill="#E9B6D7" stroke="#B97BA9" strokeWidth="1.5" />
      <circle cx="122" cy="47" r="4" fill={paint.fill("moon")} />
      <CompanionStar x={108} y={26} size={5} />
    </g>}
    <motion.g animate={state === "celebrating" && !reduced ? { rotate: [0, -14, 0] } : { rotate: 0 }} transition={{ duration: .65, repeat: state === "celebrating" ? 3 : 0 }} style={{ transformOrigin: "151px 188px" }}>
      <path d="m150 217 6-76" stroke="#B485AD" strokeWidth="6" strokeLinecap="round" />
      <path d="M164 118q-23-2-23 16q1 17 19 15q10-2 12-13q-10 9-17 1q-8-11 9-19Z" fill={paint.fill("moon")} stroke="#CEA778" strokeWidth="1.5" />
      <CompanionStar x={178} y={118} size={state === "celebrating" ? 7 : 4} fill="#C4A9EA" />
    </motion.g>
    <g transform="rotate(-10 48 193)"><rect x="35" y="185" width="25" height="24" rx="4" fill="#9C759D" stroke="#573C70" strokeWidth="2" /><path d="M41 188v17" stroke="#E5CEE2" strokeWidth="2" /><CompanionStar x={51} y={197} size={5} /></g>
    <CharacterCosmetics characterType="wizard" loadout={loadout} layer="front" />
  </CompanionFrame>;
}
