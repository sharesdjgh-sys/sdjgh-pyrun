import { and, asc, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  aiPracticeChallenges,
  concepts,
  cosmeticRewardGrants,
  userCharacterLoadouts,
  userConceptClears,
  userCosmeticItems,
  userCustomizationProfiles,
} from "@/lib/db/schema";
import {
  ACTIVE_CHARACTERS,
  aiCosmeticRewardProgress,
  COSMETIC_FAMILIES,
  randomRewardCandidates,
  completedGroupRewardFamilies,
  parseCosmeticItemKey,
} from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, CosmeticSlot } from "@/types";
import { cosmeticRewardClaimQuery } from "./cosmetic-reward-query";

type CurriculumUnit = {
  id: number;
  level: number;
  groupName: string;
  orderIndex: number;
};

export async function syncGroupRewardGrants(
  userId: number,
  curriculumId: number,
  units: CurriculumUnit[],
) {
  const clears = await db
    .select({ conceptId: userConceptClears.conceptId })
    .from(userConceptClears)
    .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
    .where(and(eq(userConceptClears.userId, userId), eq(concepts.curriculumId, curriculumId)));
  const completedGroups = completedGroupRewardFamilies(units, clears.map((item) => item.conceptId));

  if (completedGroups.length === 0) return [] as number[];
  return db
    .insert(cosmeticRewardGrants)
    .values(completedGroups.map(({ sourceKey, familyKey }) => ({
      userId,
      curriculumId,
      sourceType: "group",
      sourceKey,
      familyKey,
    })))
    .onConflictDoNothing()
    .returning({ id: cosmeticRewardGrants.id })
    .then((rows) => rows.map((row) => row.id));
}

async function getAiSolvedCounts(userId: number, curriculumId: number) {
  const rows = await db
    .select({ solvedCount: count() })
    .from(aiPracticeChallenges)
    .innerJoin(concepts, eq(aiPracticeChallenges.conceptId, concepts.id))
    .where(and(
      eq(aiPracticeChallenges.userId, userId),
      eq(concepts.curriculumId, curriculumId),
      isNotNull(aiPracticeChallenges.solvedAt),
    ))
    .groupBy(aiPracticeChallenges.conceptId);
  return rows.map((row) => Number(row.solvedCount));
}

export async function syncAiRewardGrants(userId: number, curriculumId: number) {
  const { earnedRewards: rewardCount } = aiCosmeticRewardProgress(await getAiSolvedCounts(userId, curriculumId));
  if (rewardCount < 1) return [] as number[];
  return db
    .insert(cosmeticRewardGrants)
    .values(Array.from({ length: rewardCount }, (_, index) => ({
      userId,
      curriculumId,
      sourceType: "ai",
      sourceKey: `ai:${index + 1}`,
      familyKey: null,
    })))
    .onConflictDoNothing()
    .returning({ id: cosmeticRewardGrants.id })
    .then((rows) => rows.map((row) => row.id));
}

export async function getCustomizationState(userId: number, curriculumId: number) {
  const [profiles, inventoryRows, loadoutRows, grantRows, solvedRows] = await Promise.all([
    db.select().from(userCustomizationProfiles).where(eq(userCustomizationProfiles.userId, userId)).limit(1),
    db.select({ itemKey: userCosmeticItems.itemKey }).from(userCosmeticItems).where(eq(userCosmeticItems.userId, userId)),
    db.select().from(userCharacterLoadouts).where(eq(userCharacterLoadouts.userId, userId)),
    db.select().from(cosmeticRewardGrants)
      .where(and(eq(cosmeticRewardGrants.userId, userId), eq(cosmeticRewardGrants.curriculumId, curriculumId)))
      .orderBy(asc(cosmeticRewardGrants.createdAt), asc(cosmeticRewardGrants.id)),
    getAiSolvedCounts(userId, curriculumId),
  ]);

  const inventory = inventoryRows.map((row) => row.itemKey).filter((key) => parseCosmeticItemKey(key));
  const availability = Object.fromEntries(ACTIVE_CHARACTERS.map(({ type }) => [
    type,
    randomRewardCandidates(type, inventory).length,
  ]));
  const loadouts: Record<ActiveCharacterType, CharacterLoadout> = {
    robot: {}, dog: {}, game: {}, wizard: {}, astronaut: {}, slime: {},
  };
  for (const row of loadoutRows) {
    if (!ACTIVE_CHARACTERS.some((character) => character.type === row.characterType)) continue;
    loadouts[row.characterType as ActiveCharacterType] = {
      ...(row.headItemKey ? { head: row.headItemKey } : {}),
      ...(row.faceItemKey ? { face: row.faceItemKey } : {}),
      ...(row.bodyItemKey ? { body: row.bodyItemKey } : {}),
      ...(row.backItemKey ? { back: row.backItemKey } : {}),
    };
  }

  return {
    activeCharacter: ACTIVE_CHARACTERS.some((item) => item.type === profiles[0]?.activeCharacter)
      ? profiles[0].activeCharacter as ActiveCharacterType
      : "robot" as const,
    catalog: COSMETIC_FAMILIES,
    inventory,
    loadouts,
    pendingGrants: grantRows.filter((grant) => !grant.claimedAt).map((grant) => ({
      id: grant.id,
      sourceType: grant.sourceType,
      familyKey: grant.familyKey,
      availability,
    })),
    aiProgress: aiCosmeticRewardProgress(solvedRows, grantRows.filter((grant) => grant.sourceType === "ai").length),
  };
}

export async function claimCosmeticReward(
  userId: number,
  curriculumId: number,
  grantId: number,
  characterType: ActiveCharacterType,
) {
  // One atomic statement: lock the grant, add one unowned item, then consume
  // the grant only if insertion succeeded. Neon HTTP does not support interactive transactions.
  for (let attempt = 0; attempt < 3; attempt++) {
    const result = await db.execute(cosmeticRewardClaimQuery(userId, curriculumId, grantId, characterType));
    const row = result.rows[0] as { itemKey: string } | undefined;
    if (row) return { itemKey: row.itemKey, familyKey: parseCosmeticItemKey(row.itemKey)!.family.key };
  }
  throw new Error("이미 받은 보상이거나 이 캐릭터의 아이템을 모두 모았어요. 다른 캐릭터를 선택하거나 보상 목록을 새로 확인해 주세요.");
}

export async function saveActiveCharacter(userId: number, characterType: ActiveCharacterType) {
  await db.insert(userCustomizationProfiles).values({ userId, activeCharacter: characterType })
    .onConflictDoUpdate({
      target: userCustomizationProfiles.userId,
      set: { activeCharacter: characterType, updatedAt: new Date() },
    });
}

export async function saveEquippedItem(
  userId: number,
  characterType: ActiveCharacterType,
  slot: CosmeticSlot,
  itemKey: string | null,
) {
  if (itemKey) {
    const parsed = parseCosmeticItemKey(itemKey);
    if (!parsed || parsed.characterType !== characterType || parsed.family.slot !== slot) {
      throw new Error("이 캐릭터의 해당 부위에 장착할 수 없는 아이템입니다.");
    }
    const [owned] = await db.select({ id: userCosmeticItems.id }).from(userCosmeticItems).where(and(
      eq(userCosmeticItems.userId, userId),
      eq(userCosmeticItems.itemKey, itemKey),
    )).limit(1);
    if (!owned) throw new Error("보유하지 않은 아이템입니다.");
  }
  const columnBySlot = {
    head: "headItemKey",
    face: "faceItemKey",
    body: "bodyItemKey",
    back: "backItemKey",
  } as const;
  const column = columnBySlot[slot];
  await db.insert(userCharacterLoadouts).values({ userId, characterType, [column]: itemKey })
    .onConflictDoUpdate({
      target: [userCharacterLoadouts.userId, userCharacterLoadouts.characterType],
      set: { [column]: itemKey, updatedAt: new Date() },
    });
}
