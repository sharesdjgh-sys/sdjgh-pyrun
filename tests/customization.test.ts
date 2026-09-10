import test from "node:test";
import assert from "node:assert/strict";
import {
  ACTIVE_CHARACTERS,
  COSMETIC_FAMILIES,
  cosmeticItemKey,
  isActiveCharacter,
  parseCosmeticItemKey,
  availableCosmeticItemKeys,
  completedGroupRewardFamilies,
  aiCosmeticRewardProgress,
} from "../lib/cosmetics";
import { validateFeedback } from "../lib/api-guard";

test("AI rewards count at most two solved challenges per concept", () => {
  assert.deepEqual(aiCosmeticRewardProgress([100]), { earnedRewards: 0, solved: 2, target: 3, remaining: 1 });
  assert.deepEqual(aiCosmeticRewardProgress([2, 1]), { earnedRewards: 1, solved: 0, target: 3, remaining: 3 });
  assert.deepEqual(aiCosmeticRewardProgress([100, 1]), aiCosmeticRewardProgress([2, 1]));
});

test("AI rewards require moving to other concepts for further rewards", () => {
  assert.deepEqual(aiCosmeticRewardProgress([2, 2]), { earnedRewards: 1, solved: 1, target: 3, remaining: 2 });
  assert.deepEqual(aiCosmeticRewardProgress([2, 2, 2]), { earnedRewards: 2, solved: 0, target: 3, remaining: 3 });
  assert.deepEqual(aiCosmeticRewardProgress([]), { earnedRewards: 0, solved: 0, target: 3, remaining: 3 });
});

test("previously granted AI rewards are preserved and not promised twice", () => {
  assert.deepEqual(aiCosmeticRewardProgress([6], 2), { earnedRewards: 0, solved: 0, target: 3, remaining: 7 });
  assert.deepEqual(aiCosmeticRewardProgress([2, 2, 2, 2, 1], 2), { earnedRewards: 3, solved: 0, target: 3, remaining: 3 });
});

test("all six student characters are active choices", () => {
  assert.deepEqual(ACTIVE_CHARACTERS.map((item) => item.type), ["robot", "dog", "game", "wizard", "astronaut", "slime"]);
  assert.equal(isActiveCharacter("robot"), true);
  assert.equal(isActiveCharacter("wizard"), true);
  assert.equal(isActiveCharacter("astronaut"), true);
  assert.equal(isActiveCharacter("slime"), true);
  assert.equal(isActiveCharacter("mechdog"), false);
});

test("group rewards appear only after every concept in that group is cleared", () => {
  const units = [
    { id: 1, level: 1, groupName: "자료형", orderIndex: 1 },
    { id: 2, level: 1, groupName: "자료형", orderIndex: 2 },
    { id: 3, level: 1, groupName: "연산자", orderIndex: 3 },
  ];
  assert.equal(completedGroupRewardFamilies(units, [1]).length, 0);
  assert.deepEqual(completedGroupRewardFamilies(units, [1, 2]).map((item) => item.familyKey), ["starter-antenna"]);
  assert.equal(completedGroupRewardFamilies(units, [1, 2, 3]).length, 2);
});

test("AI random candidates never include owned or duplicate items", () => {
  const candidates = availableCosmeticItemKeys(
    ["starter-antenna", "round-glasses", "round-glasses"],
    "dog",
    ["starter-antenna:dog", "round-glasses:robot"],
  );
  assert.deepEqual(candidates, ["round-glasses:dog"]);
});

test("the cosmetic catalog has one family for each current curriculum group", () => {
  assert.equal(COSMETIC_FAMILIES.length, 13);
  assert.equal(new Set(COSMETIC_FAMILIES.map((item) => item.key)).size, 13);
  assert.ok(COSMETIC_FAMILIES.every((item) => ["head", "face", "body", "back"].includes(item.slot)));
});

test("character-specific item keys round-trip for all student characters", () => {
  const key = cosmeticItemKey("round-glasses", "dog");
  assert.equal(key, "round-glasses:dog");
  assert.equal(parseCosmeticItemKey(key)?.characterType, "dog");
  assert.equal(parseCosmeticItemKey(key)?.family.slot, "face");
  assert.equal(parseCosmeticItemKey("round-glasses:wizard")?.characterType, "wizard");
  assert.equal(parseCosmeticItemKey("round-glasses:mechdog"), null);
  assert.equal(parseCosmeticItemKey("unknown:robot"), null);
});

test("feedback validation accepts a saved AI challenge id", () => {
  const value = validateFeedback({
    code: "print('ok')",
    stdout: "ok",
    stderr: "",
    isSuccess: true,
    practiceConceptId: null,
    aiChallengeId: 12,
  });
  assert.equal(value.aiChallengeId, 12);
  assert.throws(() => validateFeedback({ code: "x", isSuccess: true, aiChallengeId: 0 }));
});
