import CharacterCosmetics from "@/components/robot/CharacterCosmetics";
import { cosmeticItemKey, type CosmeticFamily } from "@/lib/cosmetics";

// Crop the actual wearable art, without rendering or dressing a character.
// Canonical robot anchors keep every catalog thumbnail consistent.
const ITEM_VIEW_BOXES: Record<string, string> = {
  "starter-antenna": "75 -4 50 52",
  "round-glasses": "46 72 108 46",
  "pastel-cap": "48 18 108 45",
  "star-badge": "78 159 44 44",
  "mini-backpack": "134 135 44 64",
  "heart-glasses": "46 66 108 56",
  "explorer-hat": "36 8 128 58",
  "code-emblem": "78 159 44 44",
  "wing-pack": "16 132 168 64",
  "sparkle-visor": "46 72 108 46",
  "crown-headset": "60 0 80 60",
  "data-core": "76 157 48 48",
  "cloud-jetpack": "134 135 44 80",
};

export default function CosmeticItemPreview({ family }: { family: CosmeticFamily }) {
  return <svg data-cosmetic-preview={family.key} viewBox={ITEM_VIEW_BOXES[family.key] ?? "0 0 200 250"} width="40" height="40" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
    <CharacterCosmetics characterType="robot" loadout={{ [family.slot]: cosmeticItemKey(family.key, "robot") }} layer={family.slot === "back" ? "behind" : "front"} />
  </svg>;
}
