import { and, asc, count, eq, isNotNull, isNull } from "drizzle-orm";
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
  COSMETIC_FAMILIES,
  cosmeticItemKey,
  availableCosmeticItemKeys,
  completedGroupRewardFamilies,
  parseCosmeticItemKey,
} from "@/lib/cosmetics";
import type { ActiveCharacterType, CharacterLoadout, CosmeticSlot } from "@/types";

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

export async function syncAiRewardGrants(userId: number, curriculumId: number) {
  const [{ solvedCount }] = await db
    .select({ solvedCount: count() })
    .from(aiPracticeChallenges)
    .innerJoin(concepts, eq(aiPracticeChallenges.conceptId, concepts.id))
    .where(and(
      eq(aiPracticeChallenges.userId, userId),
      eq(concepts.curriculumId, curriculumId),
      isNotNull(aiPracticeChallenges.solvedAt),
    ));
  const rewardCount = Math.floor(Number(solvedCount) / 3);
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
    db.select({ id: aiPracticeChallenges.id }).from(aiPracticeChallenges)
      .innerJoin(concepts, eq(aiPracticeChallenges.conceptId, concepts.id))
      .where(and(
        eq(aiPracticeChallenges.userId, userId),
        eq(concepts.curriculumId, curriculumId),
        isNotNull(aiPracticeChallenges.solvedAt),
      )),
  ]);

  const inventory = inventoryRows.map((row) => row.itemKey).filter((key) => parseCosmeticItemKey(key));
  const owned = new Set(inventory);
  const eligibleFamilies = [...new Set(grantRows
    .filter((grant) => grant.sourceType === "group" && grant.familyKey)
    .map((grant) => grant.familyKey as string))];
  const availability = Object.fromEntries(ACTIVE_CHARACTERS.map(({ type }) => [
    type,
    eligibleFamilies.filter((family) => !owned.has(cosmeticItemKey(family, type))).length,
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
    aiProgress: { solved: solvedRows.length % 3, target: 3 },
  };
}

export async function claimCosmeticReward(
  userId: number,
  curriculumId: number,
  grantId: number,
  characterType: ActiveCharacterType,
) {
  const [grant] = await db.select().from(cosmeticRewardGrants).where(and(
    eq(cosmeticRewardGrants.id, grantId),
    eq(cosmeticRewardGrants.userId, userId),
    eq(cosmeticRewardGrants.curriculumId, curriculumId),
    isNull(cosmeticRewardGrants.claimedAt),
  )).limit(1);
  if (!grant) throw new Error("이미 받았거나 존재하지 않는 보상입니다.");

  let familyKey = grant.familyKey;
  if (grant.sourceType === "ai") {
    const [groupGrants, inventoryRows] = await Promise.all([
      db.select({ familyKey: cosmeticRewardGrants.familyKey }).from(cosmeticRewardGrants).where(and(
        eq(cosmeticRewardGrants.userId, userId),
        eq(cosmeticRewardGrants.curriculumId, curriculumId),
        eq(cosmeticRewardGrants.sourceType, "group"),
        isNotNull(cosmeticRewardGrants.familyKey),
      )),
      db.select({ itemKey: userCosmeticItems.itemKey }).from(userCosmeticItems).where(eq(userCosmeticItems.userId, userId)),
    ]);
    const owned = new Set(inventoryRows.map((item) => item.itemKey));
    const candidates = availableCosmeticItemKeys(
      groupGrants.map((item) => item.familyKey as string),
      characterType,
      owned,
    ).map((key) => parseCosmeticItemKey(key)!.family.key);
    if (candidates.length === 0) throw new Error("이 캐릭터가 받을 수 있는 새 아이템이 없습니다.");
    familyKey = candidates[Math.floor(Math.random() * candidates.length)];
  }
  if (!familyKey || !COSMETIC_FAMILIES.some((family) => family.key === familyKey)) {
    throw new Error("보상 아이템 정보가 올바르지 않습니다.");
  }
  const itemKey = cosmeticItemKey(familyKey, characterType);
  const [alreadyOwned] = await db.select({ id: userCosmeticItems.id }).from(userCosmeticItems).where(and(
    eq(userCosmeticItems.userId, userId),
    eq(userCosmeticItems.itemKey, itemKey),
  )).limit(1);
  if (alreadyOwned) throw new Error("이미 가진 아이템입니다. 다른 캐릭터를 선택해 주세요.");
  const claimed = await db.update(cosmeticRewardGrants).set({
    selectedCharacter: characterType,
    itemKey,
    claimedAt: new Date(),
  }).where(and(eq(cosmeticRewardGrants.id, grantId), isNull(cosmeticRewardGrants.claimedAt)))
    .returning({ id: cosmeticRewardGrants.id });
  if (claimed.length === 0) throw new Error("이미 받은 보상입니다.");
  await db.insert(userCosmeticItems).values({ userId, itemKey, source: grant.sourceType }).onConflictDoNothing();
  return { itemKey, familyKey };
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
