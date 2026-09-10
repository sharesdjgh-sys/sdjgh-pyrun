import { parseCosmeticItemKey } from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout } from "@/types";

type Props = {
  characterType: ActiveCharacterType;
  loadout?: CharacterLoadout;
  layer: "behind" | "front";
};

function starPoints(cx: number, cy: number, outer = 10, inner = 5) {
  return Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? outer : inner;
    const angle = -Math.PI / 2 + (Math.PI * index) / 5;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
}

export default function CharacterCosmetics({ characterType, loadout = {}, layer }: Props) {
  const anchor = characterType === "slime"
    ? { faceY: 127, headY: 59, bodyY: 178, backX: 143, backY: 170 }
    : characterType === "wizard"
      ? { faceY: 104, headY: 25, bodyY: 176, backX: 143, backY: 166 }
      : characterType === "astronaut"
        ? { faceY: 96, headY: 28, bodyY: 173, backX: 144, backY: 164 }
        : characterType === "dog"
    ? { faceY: 92, headY: 34, bodyY: 171, backX: 145, backY: 158 }
    : characterType === "game"
      ? { faceY: 94, headY: 20, bodyY: 164, backX: 139, backY: 164 }
      : { faceY: 96, headY: 34, bodyY: 181, backX: 144, backY: 166 };

  if (layer === "behind") {
    const parsed = loadout.back ? parseCosmeticItemKey(loadout.back) : null;
    if (!parsed) return null;
    const { family } = parsed;
    if (family.key === "wing-pack") {
      return (
        <g aria-label={family.nameKo}>
          <path d={`M ${anchor.backX - 3} ${anchor.backY} Q ${anchor.backX + 24} ${anchor.backY - 30} ${anchor.backX + 35} ${anchor.backY - 4} Q ${anchor.backX + 22} ${anchor.backY + 2} ${anchor.backX + 4} ${anchor.backY + 18} Z`} fill={family.accent} stroke={family.color} strokeWidth="3" />
          <path d={`M ${200 - anchor.backX + 3} ${anchor.backY} Q ${200 - anchor.backX - 24} ${anchor.backY - 30} ${200 - anchor.backX - 35} ${anchor.backY - 4} Q ${200 - anchor.backX - 22} ${anchor.backY + 2} ${200 - anchor.backX - 4} ${anchor.backY + 18} Z`} fill={family.accent} stroke={family.color} strokeWidth="3" />
        </g>
      );
    }
    const jet = family.key === "cloud-jetpack";
    return (
      <g aria-label={family.nameKo}>
        <rect x={anchor.backX - 3} y={anchor.backY - 24} width="29" height="49" rx="11" fill={family.color} stroke="#FFFFFF" strokeWidth="3" />
        <rect x={anchor.backX + 3} y={anchor.backY - 16} width="17" height="19" rx="5" fill={family.accent} opacity=".9" />
        {jet && <>
          <path d={`M${anchor.backX + 2} ${anchor.backY + 22}l7 18 6-18`} fill="#FDBA74" />
          <path d={`M${anchor.backX + 14} ${anchor.backY + 22}l7 18 5-18`} fill="#FDE68A" />
        </>}
      </g>
    );
  }

  const head = loadout.head ? parseCosmeticItemKey(loadout.head) : null;
  const face = loadout.face ? parseCosmeticItemKey(loadout.face) : null;
  const body = loadout.body ? parseCosmeticItemKey(loadout.body) : null;
  return (
    <g pointerEvents="none">
      {head && head.family.key === "starter-antenna" && (
        <g aria-label={head.family.nameKo}>
          <path d={`M82 ${anchor.headY + 7} Q100 ${anchor.headY - 5} 118 ${anchor.headY + 7}`} fill="none" stroke={head.family.color} strokeWidth="5" strokeLinecap="round" />
          <line x1="100" y1={anchor.headY} x2="100" y2={anchor.headY - 18} stroke={head.family.color} strokeWidth="4" />
          <polygon points={starPoints(100, anchor.headY - 25, 9, 4)} fill={head.family.accent} stroke={head.family.color} strokeWidth="2" />
        </g>
      )}
      {head && head.family.key === "pastel-cap" && (
        <g aria-label={head.family.nameKo}>
          <path d={`M55 ${anchor.headY + 14} Q62 ${anchor.headY - 10} 102 ${anchor.headY - 10} Q130 ${anchor.headY - 6} 137 ${anchor.headY + 14}Z`} fill={head.family.color} stroke="#FFFFFF" strokeWidth="3" />
          <path d={`M96 ${anchor.headY + 11} Q132 ${anchor.headY + 6} 148 ${anchor.headY + 19} Q119 ${anchor.headY + 23} 91 ${anchor.headY + 18}Z`} fill={head.family.accent} />
        </g>
      )}
      {head && head.family.key === "explorer-hat" && (
        <g aria-label={head.family.nameKo}>
          <ellipse cx="100" cy={anchor.headY + 13} rx="58" ry="12" fill={head.family.accent} stroke={head.family.color} strokeWidth="3" />
          <path d={`M67 ${anchor.headY + 10} Q70 ${anchor.headY - 18} 100 ${anchor.headY - 20} Q130 ${anchor.headY - 18} 133 ${anchor.headY + 10}Z`} fill={head.family.color} />
          <rect x="69" y={anchor.headY + 1} width="62" height="9" rx="4" fill="#FDE68A" />
        </g>
      )}
      {head && head.family.key === "crown-headset" && (
        <g aria-label={head.family.nameKo}>
          <path d={`M72 ${anchor.headY + 12}L66 ${anchor.headY - 16}l19 12 15-22 15 22 19-12-6 28Z`} fill={head.family.color} stroke="#FFF7D6" strokeWidth="3" />
          <circle cx="100" cy={anchor.headY + 2} r="5" fill={head.family.accent} />
        </g>
      )}
      {face && face.family.key === "heart-glasses" ? (
        <g aria-label={face.family.nameKo} fill={face.family.accent} stroke={face.family.color} strokeWidth="4">
          <path d={`M53 ${anchor.faceY - 8}C53 ${anchor.faceY - 22}75 ${anchor.faceY - 24}78 ${anchor.faceY - 9}C81 ${anchor.faceY - 24}103 ${anchor.faceY - 22}103 ${anchor.faceY - 8}C103 ${anchor.faceY + 4}78 ${anchor.faceY + 18}78 ${anchor.faceY + 18}S53 ${anchor.faceY + 4}53 ${anchor.faceY - 8}Z`} />
          <path d={`M97 ${anchor.faceY - 8}C97 ${anchor.faceY - 22}119 ${anchor.faceY - 24}122 ${anchor.faceY - 9}C125 ${anchor.faceY - 24}147 ${anchor.faceY - 22}147 ${anchor.faceY - 8}C147 ${anchor.faceY + 4}122 ${anchor.faceY + 18}122 ${anchor.faceY + 18}S97 ${anchor.faceY + 4}97 ${anchor.faceY - 8}Z`} />
        </g>
      ) : face && (
        <g aria-label={face.family.nameKo} fill={face.family.accent} fillOpacity=".28" stroke={face.family.color} strokeWidth="4">
          <rect x="52" y={anchor.faceY - 16} width="42" height="29" rx={face.family.key === "sparkle-visor" ? 9 : 14} />
          <rect x="106" y={anchor.faceY - 16} width="42" height="29" rx={face.family.key === "sparkle-visor" ? 9 : 14} />
          <path d={`M94 ${anchor.faceY - 2}Q100 ${anchor.faceY - 7}106 ${anchor.faceY - 2}`} fill="none" />
          {face.family.key === "sparkle-visor" && <path d={`M61 ${anchor.faceY - 9}l22 15M115 ${anchor.faceY - 9}l22 15`} stroke="#FFFFFF" strokeWidth="3" opacity=".8" />}
        </g>
      )}
      {body && (
        <g aria-label={body.family.nameKo}>
          {body.family.key === "star-badge" ? (
            <polygon points={starPoints(100, anchor.bodyY, 14, 7)} fill={body.family.color} stroke={body.family.accent} strokeWidth="3" />
          ) : body.family.key === "code-emblem" ? (
            <g><circle cx="100" cy={anchor.bodyY} r="16" fill={body.family.color} stroke={body.family.accent} strokeWidth="3" /><path d={`M94 ${anchor.bodyY - 7}l-7 7 7 7M106 ${anchor.bodyY - 7}l7 7-7 7`} fill="none" stroke="#FFF" strokeWidth="3" strokeLinecap="round" /></g>
          ) : (
            <g><circle cx="100" cy={anchor.bodyY} r="17" fill={body.family.accent} stroke={body.family.color} strokeWidth="4" /><circle cx="100" cy={anchor.bodyY} r="8" fill={body.family.color} /><circle cx="96" cy={anchor.bodyY - 5} r="3" fill="#FFF" opacity=".8" /></g>
          )}
        </g>
      )}
    </g>
  );
}
