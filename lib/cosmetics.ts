import type { ActiveCharacterType, CosmeticSlot } from "@/types";

export const AI_REWARD_CONCEPT_LIMIT = 2;
export const AI_REWARD_TARGET = 3;

// Counts must be grouped by concept, with each solved challenge counted once.
export function aiCosmeticRewardProgress(solvedCounts: number[], grantedRewardCount = 0) {
  const eligibleSolved = solvedCounts.reduce((total, count) => total + Math.min(count, AI_REWARD_CONCEPT_LIMIT), 0);
  const earnedRewards = Math.floor(eligibleSolved / AI_REWARD_TARGET);
  // Preserve existing rewards without issuing them again after the rule changes.
  const creditedRewards = Math.max(earnedRewards, grantedRewardCount);
  return {
    earnedRewards,
    solved: Math.max(0, eligibleSolved - creditedRewards * AI_REWARD_TARGET),
    target: AI_REWARD_TARGET,
    remaining: (creditedRewards + 1) * AI_REWARD_TARGET - eligibleSolved,
  };
}

export const ACTIVE_CHARACTERS: Array<{
  type: ActiveCharacterType;
  label: string;
  color: string;
  tint: string;
}> = [
  { type: "robot", label: "로봇", color: "#7B5CF0", tint: "#F2ECFD" },
  { type: "dog", label: "강아지", color: "#D97706", tint: "#FFF7E8" },
  { type: "game", label: "전사", color: "#E2557A", tint: "#FFF0F4" },
  { type: "wizard", label: "마법사", color: "#7251D6", tint: "#F0EBFF" },
  { type: "astronaut", label: "우주비행사", color: "#1687A7", tint: "#EAF9FC" },
  { type: "slime", label: "슬라임", color: "#169E83", tint: "#E9FAF5" },
];

export type CosmeticFamily = {
  key: string;
  nameKo: string;
  slot: CosmeticSlot;
  color: string;
  accent: string;
};

export const COSMETIC_FAMILIES: CosmeticFamily[] = [
  { key: "starter-antenna", nameKo: "반짝 안테나", slot: "head", color: "#A78BFA", accent: "#FDE68A" },
  { key: "round-glasses", nameKo: "동글 안경", slot: "face", color: "#475569", accent: "#C4B5FD" },
  { key: "pastel-cap", nameKo: "파스텔 캡", slot: "head", color: "#38BDF8", accent: "#F9A8D4" },
  { key: "star-badge", nameKo: "별빛 배지", slot: "body", color: "#F59E0B", accent: "#FEF3C7" },
  { key: "mini-backpack", nameKo: "모험 가방", slot: "back", color: "#14B8A6", accent: "#99F6E4" },
  { key: "heart-glasses", nameKo: "하트 안경", slot: "face", color: "#EC4899", accent: "#FBCFE8" },
  { key: "explorer-hat", nameKo: "탐험가 모자", slot: "head", color: "#D97706", accent: "#FDE68A" },
  { key: "code-emblem", nameKo: "코드 문장", slot: "body", color: "#2563EB", accent: "#DBEAFE" },
  { key: "wing-pack", nameKo: "구름 날개", slot: "back", color: "#60A5FA", accent: "#EFF6FF" },
  { key: "sparkle-visor", nameKo: "반짝 바이저", slot: "face", color: "#7C3AED", accent: "#C4B5FD" },
  { key: "crown-headset", nameKo: "왕관 헤드셋", slot: "head", color: "#FBBF24", accent: "#F472B6" },
  { key: "data-core", nameKo: "데이터 코어", slot: "body", color: "#06B6D4", accent: "#CFFAFE" },
  { key: "cloud-jetpack", nameKo: "별구름 제트팩", slot: "back", color: "#8B5CF6", accent: "#FDE68A" },
];

export function cosmeticItemKey(familyKey: string, characterType: ActiveCharacterType) {
  return `${familyKey}:${characterType}`;
}

export function parseCosmeticItemKey(itemKey: string) {
  const [familyKey, characterType] = itemKey.split(":");
  const family = COSMETIC_FAMILIES.find((item) => item.key === familyKey);
  const character = ACTIVE_CHARACTERS.find((item) => item.type === characterType);
  if (!family || !character) return null;
  return { family, characterType: character.type, itemKey };
}

export function isActiveCharacter(value: unknown): value is ActiveCharacterType {
  return ACTIVE_CHARACTERS.some((item) => item.type === value);
}

export function availableCosmeticItemKeys(
  familyKeys: Iterable<string>,
  characterType: ActiveCharacterType,
  ownedItemKeys: Iterable<string>,
) {
  const owned = new Set(ownedItemKeys);
  return [...new Set(familyKeys)]
    .filter((key) => COSMETIC_FAMILIES.some((family) => family.key === key))
    .map((key) => cosmeticItemKey(key, characterType))
    .filter((key) => !owned.has(key));
}

export function completedGroupRewardFamilies(
  units: Array<{ id: number; level: number; groupName: string; orderIndex: number }>,
  clearedIds: Iterable<number>,
) {
  const cleared = new Set(clearedIds);
  const grouped = new Map<string, { level: number; name: string; firstOrder: number; ids: number[] }>();
  for (const unit of units) {
    const key = `${unit.level}:${unit.groupName}`;
    const group = grouped.get(key) ?? { level: unit.level, name: unit.groupName, firstOrder: unit.orderIndex, ids: [] };
    group.firstOrder = Math.min(group.firstOrder, unit.orderIndex);
    group.ids.push(unit.id);
    grouped.set(key, group);
  }
  return [...grouped.values()]
    .sort((a, b) => a.level - b.level || a.firstOrder - b.firstOrder)
    .slice(0, COSMETIC_FAMILIES.length)
    .map((group, index) => ({
      sourceKey: `group:${group.level}:${group.name}`.slice(0, 160),
      familyKey: COSMETIC_FAMILIES[index].key,
      completed: group.ids.length > 0 && group.ids.every((id) => cleared.has(id)),
    }))
    .filter((item) => item.completed);
}
