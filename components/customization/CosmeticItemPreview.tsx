import CharacterItemArt, { cosmeticItemViewBox } from "@/components/robot/CharacterItemArt";
import type { CosmeticFamily } from "@/lib/cosmetics";
import type { ActiveCharacterType } from "@/types";

export default function CosmeticItemPreview({ family, characterType }: { family: CosmeticFamily; characterType: ActiveCharacterType }) {
  return <svg data-cosmetic-preview={`${family.key}:${characterType}`} viewBox={cosmeticItemViewBox(family, characterType)} width="40" height="40" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <CharacterItemArt family={family} characterType={characterType} />
  </svg>;
}
