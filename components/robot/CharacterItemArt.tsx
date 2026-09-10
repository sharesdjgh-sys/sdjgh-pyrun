import { COSMETIC_FAMILIES, COSMETIC_PALETTES, characterCosmeticFamily, type CosmeticFamily } from "@/lib/cosmetics";
import type { ActiveCharacterType, CosmeticSlot } from "@/types";

type Palette = typeof COSMETIC_PALETTES.robot;
type ArtProps = { slot: CosmeticSlot; variant: number; p: Palette };
function Star({ x = 0, y = 0, r = 9, fill = "#FFE3A0" }: { x?: number; y?: number; r?: number; fill?: string }) {
  return <polygon points={Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, radius = i % 2 ? r * .46 : r; return `${x + Math.cos(a) * radius},${y + Math.sin(a) * radius}`; }).join(" ")} fill={fill} strokeWidth="1.5" />;
}
function Heart({ x = 0, y = 0, fill = "#FFB7C9", scale = 1, fillOpacity = 1 }: { x?: number; y?: number; fill?: string; scale?: number; fillOpacity?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M0 11C-25-3-12-19 0-8C12-19 25-3 0 11Z" fill={fill} fillOpacity={fillOpacity} strokeWidth="2" />;
}
function Moon({ x = 0, y = 0, r = 12 }: { x?: number; y?: number; r?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${r / 12})`} d="M5-12C-17-11-16 15 5 12C-7 7-7-6 5-12Z" fill="#FFE3A0" strokeWidth="1.5" />;
}
function Bone({ x = 0, y = 0, scale = 1 }: { x?: number; y?: number; scale?: number }) {
  return <path transform={`translate(${x} ${y}) scale(${scale})`} d="M-9-4C-22-17-27 1-17 1C-27 12-12 17-9 5H9C12 17 27 12 17 1C27 1 22-17 9-4Z" fill="#FFF4DC" strokeWidth="2" />;
}
function Paw() { return <g fill="#FFF4DC" strokeWidth="1.5"><ellipse cy="5" rx="10" ry="8" /><ellipse cx="-11" cy="-6" rx="4" ry="5" /><ellipse cy="-11" rx="4" ry="5" /><ellipse cx="11" cy="-6" rx="4" ry="5" /></g>; }
function Gem({ fill = "#FFD17D" }: { fill?: string }) { return <g><path d="m0-17 13 17L0 18-13 0Z" fill={fill} /><path d="m0-17-4 17 4 18 4-18Z" fill="white" fillOpacity=".45" stroke="none" /></g>; }
function Glint({ x = 0, y = 0 }: { x?: number; y?: number }) { return <path d={`M${x - 3} ${y}h6m-3-3v6`} stroke="white" strokeWidth="2" />; }
function RoundLenses({ p, square = false }: { p: Palette; square?: boolean }) {
  return <g><path d="M-7-2q7-6 14 0m-53-2-8-3m100 3 8-3" fill="none" />{[-25,25].map(x => square ? <rect key={x} x={x-18} y="-16" width="36" height="30" rx="7" fill={p.light} fillOpacity=".2" /> : <ellipse key={x} cx={x} rx="18" ry="17" fill={p.light} fillOpacity=".18" />)}</g>;
}

function RobotArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g><path d="M-32 10q32-15 64 0M0 3v-26" fill="none" strokeWidth="4" /><circle cy="-27" r="11" fill={p.accent} /><Star y={-27} r={6} fill={p.light} /><path d="M-20-30q-8 6 0 12m40-12q8 6 0 12" fill="none" stroke={p.accent} /></g>;
    if (v === 1) return <g><path d="M-43 8q4-33 43-33 36 0 43 33Z" /><path d="M-10 5h50q20 3 20 11H-12Z" fill={p.accent} /><rect x="-11" y="-17" width="22" height="14" rx="4" fill={p.ink} /><path d="m-5-10 4 4 6-7" stroke={p.light} fill="none" /></g>;
    if (v === 2) return <g><path d="M-47 12v-20q47-24 94 0v20" fill="none" strokeWidth="5" />{[-47,47].map(x=><g key={x}><rect x={x-8} y="-8" width="16" height="28" rx="6" /><path d={`M${x}-8v-22`} /><circle cx={x} cy="-32" r="6" fill={p.accent} /></g>)}<path d="M-23-14h46" stroke={p.accent} strokeWidth="4" /></g>;
    return <g><path d="m-34 12-8-34 25 13L0-37 17-9l25-13-8 34Z" /><path d="M-33 4h66v10h-66Z" fill={p.ink} /><Gem fill={p.accent} /><circle cx="-25" cy="5" r="3" fill={p.light} /><circle cx="25" cy="5" r="3" fill={p.light} /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g><RoundLenses p={p} square /><path d="M-35-8h6m3 0h6m28 0h6m3 0h6" stroke={p.accent} strokeWidth="3" /><path d="M-37 8h9m37 0h9" stroke={p.main} /></g>;
    if (v === 1) return <g><RoundLenses p={p} square /><Heart x={-25} y={-5} scale={.48} fill={p.accent} /><Heart x={25} y={-5} scale={.48} fill={p.accent} /></g>;
    return <g><path d="M-47-15h94v22l-16 11H-31L-47 7Z" fill={p.accent} fillOpacity=".2" /><path d="M-37-9h28m5 0h8m5 0h28" stroke={p.main} /><path d="m-28-8 14 20m8-20 14 20" stroke="white" opacity=".65" /><circle cx="43" cy="1" r="3" fill={p.accent} /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><rect x="-21" y="-21" width="42" height="42" rx="10" fill={p.ink} /><path d="m3-15-16 18H0l-3 12L13-4H1Z" fill={p.accent} stroke="none" /><Glint x={14} y={12} /></g>;
    if (v === 1) return <g><rect x="-20" y="-18" width="40" height="36" rx="8" fill={p.light} /><path d="m-7-7-8 7 8 7m14-14 8 7-8 7" fill="none" /><path d="M-26-10h6m-6 10h6m-6 10h6m40-20h6m-6 10h6m-6 10h6" stroke={p.accent} strokeWidth="3" /></g>;
    return <g><path d="m0-24 21 12v24L0 24-21 12v-24Z" fill={p.ink} /><circle r="15" fill={p.accent} /><circle r="8" fill={p.light} /><Glint x={-5} y={-5} /></g>;
  }
  if (v === 0) return <g>{[-1,1].map(s=><g key={s} transform={`translate(${s*52} 0)`}><rect x="-14" y="-28" width="28" height="61" rx="9" /><rect x="-7" y="-19" width="14" height="38" rx="4" fill={p.ink} />{[-10,0,10].map(y=><path key={y} d={`M-3 ${y}h6`} stroke={p.accent} strokeWidth="4" />)}<path d="M-6-29v-7H6v7" fill={p.light} /></g>)}</g>;
  if (v === 1) return <g>{[-1,1].map(s=><g key={s} transform={`scale(${s} 1)`}><path d="M25-14 76-42 68-4 34 29Z" fill={p.accent} fillOpacity=".55" /><path d="m35-9 28-18-5 20-20 17" fill="none" stroke={p.light} /><circle cx="30" r="7" /></g>)}</g>;
  return <g>{[-1,1].map(s=><g key={s} transform={`translate(${s*52} 0)`}><rect x="-14" y="-30" width="28" height="52" rx="10" fill={p.light} /><path d="M-14 4h28v18h-28Z" /><path d="m-9 23 9 25 9-25" fill={p.accent} /><path d="m-4 24 4 13 4-13" fill="white" stroke="none" /><circle cy="-12" r="7" fill={p.accent} /></g>)}</g>;
}

function DogArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g transform="rotate(-12)"><path d="M-26 9h52" stroke={p.accent} strokeWidth="7" /><Bone y={-2} /><Heart x={23} y={-13} scale={.35} fill={p.accent} /></g>;
    if (v === 1) return <g><path d="M-34 8q-3-30 34-32 37 2 34 32Z" fill={p.accent} /><path d="M-45 9q45-11 90 0l-9 10h-72Z" fill={p.light} /><path d="m0-28-8-9 8 3 8-3Z" fill="#89BE83" />{[-17,0,17].map(x=><path key={x} d={`m${x}-12 2 4`} stroke={p.light} />)}</g>;
    if (v === 2) return <g><ellipse cy="10" rx="46" ry="9" fill={p.light} /><path d="M-30 7q-2-27 30-30 32 3 30 30Z" /><path d="M-29-1q29 10 58 0" fill="none" stroke={p.accent} strokeWidth="7" /><path d="M-15-22q-4-15 9-16q2 13-9 16" fill="#91BD78" /><Bone x={9} scale={.38} /></g>;
    return <g><path d="m-25 11 25-49 25 49Z" fill={p.accent} /><path d="m-14-12 27 9m-34 9 41 0" stroke={p.light} strokeWidth="5" /><circle cy="-37" r="7" fill={p.light} /><path d="M-29 12h58" stroke={p.main} strokeWidth="7" /><Star r={6} /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g><RoundLenses p={p} /><Bone x={-47} y={-9} scale={.2} /><Bone x={47} y={-9} scale={.2} /></g>;
    if (v === 1) return <g><path d="M-9-2q9-6 18 0m-50-1-11-4m93 4 11-4" fill="none" /><Heart x={-25} y={1} scale={1.25} fill={p.light} fillOpacity={.15} /><Heart x={25} y={1} scale={1.25} fill={p.light} fillOpacity={.15} /><Heart x={-44} y={-9} scale={.3} fill={p.accent} /><Heart x={44} y={-9} scale={.3} fill={p.accent} /></g>;
    return <g><RoundLenses p={{...p,light:"#B7EBF3"}} square /><path d="M43 10h9v-33h-9" stroke={p.accent} strokeWidth="5" fill="none" /><path d="m-35-8 8 5m15-5 8 5" stroke="white" /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><path d="M-29-17q29 16 58 0" fill="none" stroke={p.accent} strokeWidth="7" /><Bone y={5} scale={.9} /></g>;
    if (v === 1) return <g><path d="m-11-26 11 18 11-18" fill={p.accent} /><circle cy="3" r="20" /><g transform="translate(0 3) scale(.9)"><Paw /></g></g>;
    return <g><path d="M-28-17q28 12 56 0L0 26Z" fill={p.accent} /><path d="m-18-13 36 0" stroke={p.light} strokeWidth="3" /><Heart y={3} scale={.65} fill={p.light} /><path d="m23-14 8 5-7 10-7-16" /></g>;
  }
  if (v === 0) return <g transform="translate(52 0)"><path d="M-10-26q0-14 20 0" fill="none" /><rect x="-20" y="-26" width="40" height="62" rx="14" /><path d="M-20-8q20 12 40 0v-18h-40Z" fill={p.light} /><Bone y={-10} scale={.52} /><rect x="-13" y="10" width="26" height="18" rx="6" fill={p.accent} /></g>;
  if (v === 1) return <g>{[-1,1].map(s=><g key={s} transform={`scale(${s} 1)`}><path d="M31-4C28-47 84-46 76-13C98 11 57 38 31 5Z" fill={p.accent} /><path d="M39-5q24-21 26-10M39 2q22 18 28 8" stroke={p.light} strokeWidth="4" fill="none" /></g>)}</g>;
  return <g transform="translate(52 0)"><rect x="-21" y="-27" width="42" height="61" rx="9" fill={p.accent} /><path d="m-21-23 21 20 21-20" fill={p.light} /><path d="M-21 9h42" stroke={p.main} strokeWidth="5" /><Heart y={-3} scale={.5} fill={p.main} /><rect x="-13" y="16" width="26" height="11" rx="3" fill={p.light} /><path d="M-7 20H7" /></g>;
}

function GameArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g><path d="m-35 12-3-20 18-15h40L38-8l-3 20Z" /><path d="M-33 3h66" stroke={p.light} strokeWidth="5" /><path d="M0-22q-22-24-23-6q0 14 23 6q22-24 23-6q0 14-23 6" fill="#A4D691" /><path d="M0-22v13" /><Gem fill={p.accent} /></g>;
    if (v === 1) return <g><path d="M-33-9q-22-7-20-28-20 26 17 39m69-11q22-7 20-28 20 26-17 39" fill={p.light} /><path d="m-36 13-2-24 20-16h36l20 16-2 24Z" /><path d="M-36 8h72M0-26V9" stroke={p.accent} strokeWidth="5" /></g>;
    if (v === 2) return <g><path d="m-41 13 4-28 19-12h36l19 12 4 28Z" /><path d="m-10-24 10-22 10 22-10 13Z" fill={p.accent} /><path d="m-28-8 10 9 10-9m16 0 10 9 10-9" stroke={p.light} fill="none" strokeWidth="4" /><path d="M-41 11h82" stroke={p.accent} strokeWidth="4" /></g>;
    return <g><path d="m-37 13-8-40 28 17L0-43 17-10l28-17-8 40Z" fill={p.accent} /><path d="M-36 5h72v10h-72Z" /><Gem fill={p.main} /><path d="m-29-15 4 13m54-13-4 13" stroke={p.light} /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g><path d="m-48-15 37-4 11 9 11-9 37 4-6 29-29 6-13-10-13 10-29-6Z" fill={p.light} fillOpacity=".16" /><path d="M-38-8h18m40 0h18" stroke={p.accent} strokeWidth="4" /><path d="M-8-5 0 5 8-5" fill="none" /></g>;
    if (v === 1) return <g><RoundLenses p={p} square />{[-25,25].map(x=><path key={x} d={`m${x-12}-16 5-9 4 9 5-6 2 8`} fill={p.accent} />)}</g>;
    return <g>{[-25,25].map(x=><g key={x} transform={`translate(${x} 0)`}><path d="m-21-9 12-11 27 4 3 28-14 9-26-8Z" fill={p.light} fillOpacity=".25" /><path d="m-12-10 16 23m-8-26 13 18" stroke={p.accent} strokeWidth="2" /></g>)}<path d="M-6-2H6" /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><path d="m0-25 24 8-4 31L0 28-20 14-24-17Z" fill={p.accent} /><path d="m0-18 16 6-3 21L0 19-13 9-16-12Z" /><Star r={11} fill={p.light} /></g>;
    if (v === 1) return <g><Star r={28} fill={p.accent} /><circle r="17" /><Gem fill={p.light} /></g>;
    return <g><path d="m-27-16 14-10 13 8 13-8 14 10-6 31L0 26-21 15Z" /><path d="m-20-9 20 7 20-7m-36 25 16-5 16 5" stroke={p.light} fill="none" /><Gem fill={p.accent} /></g>;
  }
  if (v === 0) return <g transform="translate(53 0)"><path d="m0-38 24 13-3 45L0 41-21 20-24-25Z" fill={p.ink} /><path d="m0-29 17 10-3 33L0 30-14 14-17-19Z" /><path d="m0-19-7 15 7 17 7-17Z" fill={p.accent} /><path d="M-10 22 0 29l10-7" stroke={p.light} /></g>;
  if (v === 1) return <g><path d="M-35-33 35-33 76 42 42 34 19 47 0 36-19 47-42 34-76 42Z" /><path d="M-30-25-59 31m89-56 29 56" stroke={p.accent} strokeWidth="4" /><path d="M-15-23 0 0l15-23" fill={p.light} /></g>;
  return <g>{[-1,1].map(s=><g key={s} transform={`rotate(${s*32}) translate(${s*25} 0)`}><path d="M-6-40H6v66L0 40-6 26Z" fill={p.light} /><path d="M-13-18h26M0-39v17" stroke={p.accent} strokeWidth="7" /><path d="M0-11v34" stroke={p.main} /></g>)}</g>;
}

function WizardArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g><path d="M-34 11q34-23 68 0" fill="none" strokeWidth="5" /><Moon y={-13} r={18} /><Star x={25} y={-18} r={8} /><circle cx="-28" cy="2" r="4" fill={p.accent} /></g>;
    if (v === 1) return <g><path d="m-29 8 18-50 31 8-15 8 25 34Z" /><ellipse cy="12" rx="52" ry="9" fill={p.ink} /><path d="M-23-2h46l6 12h-58Z" fill="#DBA7DA" /><Star x={-4} y={-24} r={6} /><Star x={15} y={-13} r={4} /></g>;
    if (v === 2) return <g><path d="M-50 8C-46-39 45-39 50 8Z" fill="#C58DBA" /><ellipse cy="9" rx="50" ry="9" fill={p.light} />{[-27,0,27].map((x,i)=><ellipse key={x} cx={x} cy={i===1?-20:-6} rx="7" ry="5" fill={p.accent} />)}<Moon x={6} y={9} r={7} /></g>;
    return <g><path d="m-37 12-5-29 25 14L0-24 17-3l25-14-5 29Z" fill={p.accent} /><path d="M-36 7h72" stroke={p.main} strokeWidth="6" /><Moon y={-29} r={15} /><circle cx="-24" cy="2" r="4" /><circle cx="24" cy="2" r="4" /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g><RoundLenses p={p} /><Moon x={-44} y={-14} r={8} /><Star x={45} y={-14} r={6} /></g>;
    if (v === 1) return <g>{[-1,1].map(s=><path key={s} transform={`scale(${s} 1)`} d="M8 1C8-29 32-21 33-12C52-28 58-1 43 8C48 28 15 24 8 1Z" fill={p.light} fillOpacity=".3" />)}<path d="M-8 0H8" /><Star y={-4} r={5} /></g>;
    return <g>{[-25,25].map(x=><g key={x} transform={`translate(${x} 0)`}><path d="m-20-9 13-13 24 8 5 22-22 14-21-16Z" fill={p.light} fillOpacity=".22" /><path d="m-12-9 5 9 13-4-3 13" stroke={p.accent} fill="none" /><circle cx="-7" r="2" fill={p.accent} /><circle cx="6" cy="-4" r="2" fill={p.accent} /></g>)}<path d="M-5-3H5" /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><path d="m-27-18 27 10 27-10-12 26L0 20-15 8Z" fill={p.light} /><Moon y={1} r={19} /><Star x={14} y={-6} r={7} /></g>;
    if (v === 1) return <g><path d="m0-27 22 12v30L0 28-22 15v-30Z" /><path d="m-13-10 13 6 11-10-5 27-13 4Z" fill="none" stroke={p.accent} />{[[-13,-10],[0,-4],[11,-14],[6,13],[-7,17]].map(([x,y])=><circle key={`${x}:${y}`} cx={x} cy={y} r="3" fill={p.light} />)}</g>;
    return <g><path d="M-6-20h12v10q24 23 0 34H-6q-24-11 0-34Z" fill={p.light} fillOpacity=".8" /><path d="M-15 6q15-10 30 0q4 15-15 17Q-19 21-15 6" fill="#E3A6D3" /><rect x="-8" y="-26" width="16" height="8" rx="3" fill={p.accent} /><Star y={9} r={7} /><Glint x={-10} /></g>;
  }
  if (v === 0) return <g transform="translate(54 0) rotate(12)"><path d="M-23-28h40v63h-40Z" fill={p.light} /><rect x="-25" y="-31" width="40" height="63" rx="5" /><path d="M-17-29v59" stroke={p.accent} /><Moon r={13} /><path d="M16-20h8m-8 8h8m-8 8h8" stroke={p.light} /></g>;
  if (v === 1) return <g><path d="M-33-31Q-39 5-76 38l23-4 12 13 19-10 22 12 22-12 19 10 12-13 23 4Q39 5 33-31Z" fill={p.ink} /><path d="M-29-24q-7 38-29 55m87-55q7 38 29 55" stroke={p.main} strokeWidth="4" /><Star x={-49} y={17} r={7} /><Star x={43} y={26} r={6} /><Moon x={-20} y={30} r={9} /></g>;
  return <g transform="translate(49 0) rotate(19)"><path d="M0-43v67" stroke="#B08763" strokeWidth="7" /><path d="m-10 8 20 0 15 38-24-6-25 6Z" fill={p.accent} /><path d="M-11 10h22" stroke={p.main} strokeWidth="7" /><path d="m-6 18-8 21m14-21v20m6-20 8 21" stroke="#C58D66" strokeWidth="2" /><Star x={10} y={-27} r={7} /></g>;
}

function AstronautArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g><path d="M-28 11h56M0 8v-24" strokeWidth="5" /><path d="M-19-25q19 31 38 0Z" fill={p.light} /><path d="M0-18 10-33" /><circle cx="12" cy="-35" r="5" fill={p.accent} /></g>;
    if (v === 1) return <g><path d="M-41 13V-4q41-43 82 0v17Z" fill={p.light} /><path d="M-42 9h84v9h-84Z" /><path d="M-8-15q8-19 16 0v14H-8Z" fill={p.accent} /><circle cy="-10" r="4" /><path d="m-8-4-8 8h8m16-8 8 8h-8" /></g>;
    if (v === 2) return <g><path d="M-36 10q-5-42 36-42 41 0 36 42Z" fill={p.light} /><ellipse cy="5" rx="56" ry="10" fillOpacity=".55" /><path d="M-37 2q37 17 74 0" stroke={p.accent} strokeWidth="5" fill="none" /><Star y={-16} r={8} fill={p.accent} /></g>;
    return <g><path d="m-38 13-3-29 23 11L0-35 18-5l23-11-3 29Z" fill={p.light} /><path d="M-38 8h76" stroke={p.main} strokeWidth="7" /><Star y={-7} r={13} fill={p.accent} /><circle cx="-40" cy="11" r="8" /><circle cx="40" cy="11" r="8" /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g><path d="M-47-20h94v38h-94Z" fillOpacity=".1" strokeDasharray="12 7" /><path d="M-35-10h12m-12 7h8m39 13h12m-8-7h8" stroke={p.accent} /><circle cx="24" cy="-6" r="8" fill="none" /><path d="M24-17v5m0 11v5M13-6h5m12 0h5" /></g>;
    if (v === 1) return <g><RoundLenses p={p} square /><Star x={-44} y={-18} r={7} fill={p.accent} /><Star x={44} y={-18} r={7} fill={p.accent} /><path d="m-33-9 9 4m41-4 9 4" stroke={p.light} /></g>;
    return <g><path d="M-49-13q49-21 98 0v24q-49 20-98 0Z" fillOpacity=".18" /><path d="M-40-7q40-13 80 0" stroke={p.light} strokeWidth="4" fill="none" /><Star x={30} y={-2} r={6} fill={p.accent} /><path d="M-33 10h15m4 0h4" stroke={p.accent} /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><circle r="22" fill={p.ink} /><circle r="13" fill={p.accent} /><ellipse rx="25" ry="7" transform="rotate(-25)" fill="none" stroke={p.light} strokeWidth="4" /><Glint x={-5} y={-6} /></g>;
    if (v === 1) return <g><rect x="-23" y="-22" width="46" height="44" rx="12" fill={p.light} /><circle cx="-4" cy="2" r="13" /><circle cx="-8" cy="-1" r="4" fill={p.light} /><circle cy="9" r="3" fill={p.light} /><path d="M8 6v-23l14 3-14 7" fill={p.accent} /></g>;
    return <g><circle r="25" fill={p.light} /><circle r="18" fill={p.ink} /><path d="m0-15 7 15-7 16-7-16Z" fill={p.accent} /><path d="m0 1 7-1-7 16Z" /><circle r="3" fill={p.light} /></g>;
  }
  if (v === 0) return <g>{[-1,1].map(s=><g key={s} transform={`translate(${s*52} 0)`}><rect x="-13" y="-34" width="26" height="70" rx="13" fill={p.light} /><path d="M-13-10h26v18h-26Z" /><path d="M-5-35v-6H5v6" fill={p.accent} /><path d="M-8 19H8" stroke={p.accent} strokeWidth="5" /></g>)}</g>;
  if (v === 1) return <g>{[-1,1].map(s=><g key={s} transform={`scale(${s} 1)`}><path d="M29-3h10" strokeWidth="5" /><path d="m40-34 37-5v68l-37-5Z" fill="#3B79B5" /><path d="M52-34v59m12-61v63M42-16l33-3M42 3h33M42 19l33 3" stroke={p.light} strokeWidth="1.5" /></g>)}</g>;
  return <g>{[-1,1].map(s=><g key={s} transform={`translate(${s*54} 0)`}><path d="M-13-20 0-40 13-20v44h-26Z" fill={p.light} /><path d="M-13 1-22 20h9m26-19 9 19h-9" /><circle cy="-10" r="7" /><path d="m-9 24 9 27 9-27" fill={p.accent} /><path d="m-4 25 4 14 4-14" fill="#FFF4B9" stroke="none" /></g>)}</g>;
}

function SlimeArt({ slot, variant: v, p }: ArtProps) {
  if (slot === "head") {
    if (v === 0) return <g><path d="M0 12v-23" strokeWidth="4" /><path d="M0-8q-34 7-26-22Q-3-35 0-8q34 7 26-22Q3-35 0-8" /><path d="m-18-23 15 10m21-10L3-13" stroke={p.light} /><circle cy="11" r="7" fill={p.accent} /></g>;
    if (v === 1) return <g><path d="M-36 12-29-19q29-15 58 0l7 31Z" fill="#FFE6AC" stroke="#BF9B69" /><path d="M-29-19q29-15 58 0l-3 11-10-4-12 7L-9-11-23-7Z" fill="#C99977" stroke="#AF7E5C" /><ellipse cy="13" rx="41" ry="7" fill={p.light} /><circle cy="-28" r="7" fill={p.accent} /><path d="M0-34q1-9 8-9" fill="none" /><Glint x={-16} y={-1} /></g>;
    if (v === 2) return <g><path d="M0 13q-52 5-48-26Q-17-18 0 13q52 5 48-26Q17-18 0 13" /><path d="M0 12q-29-19-16-43Q4-24 0 12q29-19 16-43Q-4-24 0 12" fill={p.accent} /><path d="M0 13q-16-28 0-53 16 25 0 53" fill="#FFE5EB" /><ellipse cy="14" rx="32" ry="6" fill={p.light} /></g>;
    return <g><path d="M-34 12q-14-44 0-34L-17-9Q0-57 17-9l17-13q14-10 0 34Z" fill={p.accent} fillOpacity=".85" /><path d="M-29 8h58" stroke={p.light} strokeWidth="5" /><circle cy="-7" r="8" /><Glint x={-22} y={-9} /><Glint x={2} y={-9} /></g>;
  }
  if (slot === "face") {
    if (v === 0) return <g>{[-25,25].map(x=><path key={x} transform={`translate(${x} 0)`} d="M0-22C-32 4-17 22 0 18C17 22 32 4 0-22Z" fill={p.light} fillOpacity=".3" />)}<path d="M-6 0H6" /><path d="m-35-4 5-6m45 6 5-6" stroke="white" strokeWidth="3" /></g>;
    if (v === 1) return <g><RoundLenses p={p} /><path d="M-25-18q7-14 25-12 18-2 25 12" fill="none" /><path d="M0-30q7-15 20-8Q17-26 0-30" /><path d="m-34-7 4-3m46 3 4-3" stroke="white" strokeWidth="3" /><circle cx="-41" cy="13" r="4" fill={p.accent} /><circle cx="41" cy="13" r="4" fill={p.accent} /></g>;
    return <g>{[-25,25].map(x=><g key={x}><circle cx={x} r="21" fill={p.light} fillOpacity=".2" /><path d={`M${x-13}-7q3-7 10-7`} fill="none" stroke="white" strokeWidth="3" /><path d={`M${x+12} 8l-4 5`} stroke={p.accent} strokeWidth="3" /></g>)}<path d="M-4-3H4" /><circle cx="49" cy="-18" r="4" fill={p.accent} /></g>;
  }
  if (slot === "body") {
    if (v === 0) return <g><Heart scale={1.7} fill={p.accent} /><path d="m-12-7 4-3" stroke="white" strokeWidth="4" /><path d="M0-18q7-13 17-9Q15-14 0-18" /></g>;
    if (v === 1) return <g><Star r={26} fill="#FFE5A0" /><Star r={14} fill={p.accent} /><Glint x={-7} y={-9} /><circle cx="8" cy="8" r="3" fill={p.light} /></g>;
    return <g><path d="M-25 8q-9-35 8-28 6-15 17-4 11-11 17 4 17-7 8 28L0 24Z" fill={p.accent} /><path d="m-15-13 7 23m23-23-7 23M0-17v25" stroke={p.light} /><circle cy="9" r="11" fill="#FFF9EF" /><Glint x={-3} y={6} /></g>;
  }
  if (v === 0) return <g transform="translate(54 0)"><path d="M-22 21q-8-53 8-48 7-15 14-5 7-10 14 5 16-5 8 48L0 35Z" fill={p.accent} /><path d="M0-24v43m-13-36 6 35m20-35-6 35" stroke={p.light} strokeWidth="3" /><circle cy="22" r="7" fill={p.light} /><Glint x={-13} y={-11} /></g>;
  if (v === 1) return <g>{[-1,1].map(s=><g key={s} transform={`scale(${s} 1)`}><path d="M29 8Q42-53 75-35 90-12 29 8Q65-7 72 16 58 38 29 8Z" fillOpacity=".65" /><path d="M44-11q10-16 20-18" stroke={p.light} strokeWidth="4" fill="none" /><circle cx="74" cy="-43" r="5" fill={p.accent} /></g>)}</g>;
  return <g transform="translate(48 0)"><path d="M0 32Q43 14 21-28Q9-2-6 1q-21 16 6 31Z" fill={p.accent} /><path d="M0 24Q29 9 20-16Q10 6 2 8q-11 8-2 16Z" fill="#FFE6A4" stroke="none" /><path d="M1 19q15-10 17-23" stroke={p.light} strokeWidth="4" fill="none" /><circle cx="31" cy="-30" r="7" /><circle cx="15" cy="-44" r="4" fill={p.accent} /></g>;
}

export function cosmeticItemViewBox(family: CosmeticFamily, characterType: ActiveCharacterType) {
  if (family.slot === "head") return "-68 -54 136 80";
  if (family.slot === "face") return "-60 -46 120 78";
  if (family.slot === "body") return "-36 -36 72 72";
  const sideItem = (["dog","wizard","slime","game"].includes(characterType) && family.key === "mini-backpack") || (["dog","wizard","slime"].includes(characterType) && family.key === "cloud-jetpack");
  return sideItem ? "6 -58 98 120" : "-94 -58 188 120";
}

export default function CharacterItemArt({ family, characterType }: { family: CosmeticFamily; characterType: ActiveCharacterType }) {
  const variant = COSMETIC_FAMILIES.filter(item => item.slot === family.slot).findIndex(item => item.key === family.key);
  const p = COSMETIC_PALETTES[characterType];
  const Art = { robot: RobotArt, dog: DogArt, game: GameArt, wizard: WizardArt, astronaut: AstronautArt, slime: SlimeArt }[characterType];
  return <g data-item-art={`${family.key}:${characterType}`} aria-label={characterCosmeticFamily(family, characterType).nameKo} fill={p.main} stroke={p.ink} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"><Art slot={family.slot} variant={variant} p={p} /></g>;
}
