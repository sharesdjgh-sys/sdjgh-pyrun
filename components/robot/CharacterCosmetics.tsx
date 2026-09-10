import { parseCosmeticItemKey } from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, CosmeticSlot } from "@/types";
import CharacterItemArt from "./CharacterItemArt";

type Props = { characterType: ActiveCharacterType; loadout?: CharacterLoadout; layer: "behind" | "front"; slots?: CosmeticSlot[] };
const ANCHORS: Record<ActiveCharacterType, { head: number; face: number; body: number; back: number }> = {
  robot: { head: 34, face: 96, body: 181, back: 166 },
  dog: { head: 34, face: 92, body: 171, back: 166 },
  game: { head: 45, face: 110, body: 182, back: 168 },
  wizard: { head: 52, face: 107, body: 180, back: 166 },
  astronaut: { head: 38, face: 110, body: 186, back: 169 },
  slime: { head: 59, face: 127, body: 178, back: 170 },
};

export default function CharacterCosmetics({ characterType, loadout = {}, layer, slots }: Props) {
  const visibleSlots: CosmeticSlot[] = slots ?? (layer === "behind" ? ["back"] : ["head", "face", "body"]);
  return <g pointerEvents="none" data-cosmetic-layer={layer}>
    {visibleSlots.map(slot => {
      const key = loadout[slot];
      const item = key ? parseCosmeticItemKey(key) : null;
      if (!item || item.characterType !== characterType || item.family.slot !== slot) return null;
      return <g key={slot} data-cosmetic-slot={slot} transform={`translate(100 ${ANCHORS[characterType][slot]})`}><CharacterItemArt family={item.family} characterType={characterType} /></g>;
    })}
  </g>;
}
