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

const CHARACTER_ITEM_NAMES: Record<ActiveCharacterType, string[]> = {
  robot: ["별 신호 안테나", "픽셀 고글", "네온 캡", "번개 칩", "배터리 팩", "하트 LED 고글", "위성 헤드셋", "코딩 프로세서", "홀로그램 날개", "오로라 바이저", "마스터 크라운", "플라스마 코어", "쌍둥이 추진기"],
  dog: ["뼈다귀 머리핀", "산책 동글 안경", "딸기 산책 모자", "뼈다귀 목걸이", "간식 배낭", "하트 산책 안경", "도토리 탐험 모자", "발바닥 메달", "나비 산책 날개", "물놀이 고글", "생일 파티 모자", "딸기 스카프", "우편 배낭"],
  game: ["새싹 돌 투구", "수호자 눈가리개", "꼬마 뿔 투구", "용기 방패 문장", "룬 방패", "불꽃 전투 고글", "용비늘 투구", "태양 수호석", "새벽 수호 망토", "수정 눈 보호대", "용왕의 왕관", "용심장 갑옷", "쌍검 장비"],
  wizard: ["초승달 머리장식", "달빛 안경", "별사탕 마녀 모자", "달빛 브로치", "날아다니는 마법책", "나비 마법 안경", "버섯 마녀 모자", "별자리 부적", "밤하늘 망토", "별점 수정 안경", "달의 여왕 관", "소원 물약 목걸이", "꼬마 빗자루"],
  astronaut: ["위성 수신기", "탐사 HUD", "로켓 비행 캡", "토성 탐사 배지", "산소 탱크", "별빛 탐사 고글", "토성 통신 헬멧", "달 탐사 패치", "태양광 날개", "은하수 바이저", "캡틴 통신관", "우주 나침반", "로켓 부스터"],
  slime: ["새싹 젤리핀", "물방울 안경", "푸딩 모자", "복숭아 젤리 하트", "조개 보물 가방", "체리 젤리 안경", "연꽃 모자", "별사탕 젤리", "물방울 날개", "비눗방울 고글", "젤리 왕관", "진주 조개 장식", "무지개 물방울 꼬리"],
};

export const COSMETIC_PALETTES: Record<ActiveCharacterType, { ink: string; main: string; light: string; accent: string }> = {
  robot: { ink: "#65528E", main: "#A78BFA", light: "#F0EBFF", accent: "#68E3D5" },
  dog: { ink: "#A86B49", main: "#EFAD72", light: "#FFF2D8", accent: "#EE91AC" },
  game: { ink: "#425F69", main: "#6CACA6", light: "#DCEBD5", accent: "#FFD17D" },
  wizard: { ink: "#594076", main: "#9874CB", light: "#EEE1FF", accent: "#FFE3A0" },
  astronaut: { ink: "#34647F", main: "#7ACBEB", light: "#F0FAFF", accent: "#FFC080" },
  slime: { ink: "#309F8C", main: "#8DE7C9", light: "#E7FFF5", accent: "#FFB7C9" },
};

export function characterCosmeticFamily(family: CosmeticFamily, characterType: ActiveCharacterType): CosmeticFamily {
  const index = COSMETIC_FAMILIES.findIndex((item) => item.key === family.key);
  const palette = COSMETIC_PALETTES[characterType];
  return { ...family, nameKo: CHARACTER_ITEM_NAMES[characterType][index] ?? family.nameKo, color: palette.main, accent: palette.light };
}

export function randomRewardCandidates(characterType: ActiveCharacterType, owned: Iterable<string>) {
  return availableCosmeticItemKeys(COSMETIC_FAMILIES.map((family) => family.key), characterType, owned);
}

export function cosmeticItemKey(familyKey: string, characterType: ActiveCharacterType) {
  return `${familyKey}:${characterType}`;
}

export function parseCosmeticItemKey(itemKey: string) {
  const [familyKey, characterType] = itemKey.split(":");
  const family = COSMETIC_FAMILIES.find((item) => item.key === familyKey);
  const character = ACTIVE_CHARACTERS.find((item) => item.type === characterType);
  if (!family || !character) return null;
  return { family: characterCosmeticFamily(family, character.type), characterType: character.type, itemKey };
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
