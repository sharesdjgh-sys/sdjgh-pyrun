import test from "node:test";
import assert from "node:assert/strict";
import { RequestValidationError, validateFeedback, validateRegistration } from "../lib/api-guard";
import { authenticatedUserId, calculateProgress, isConceptUnlocked, nextConceptId } from "../lib/progress";

test("authentication helper rejects missing and malformed sessions", () => {
  assert.equal(authenticatedUserId(null), null);
  assert.equal(authenticatedUserId({ user: { id: "abc" } }), null);
  assert.equal(authenticatedUserId({ user: { id: "7" } }), 7);
});

test("progress calculation is bounded and uses dynamic totals", () => {
  assert.equal(calculateProgress(4, 16), 25);
  assert.equal(calculateProgress(20, 16), 100);
  assert.equal(calculateProgress(1, 0), 0);
});

test("API validation enforces account and payload limits", () => {
  assert.throws(() => validateRegistration({ username: "abc", password: "12345678" }), RequestValidationError);
  assert.equal(validateRegistration({ username: "student_1", password: "12345678" }).username, "student_1");
  assert.equal(validateFeedback({ code: "print(1)", stdout: "x".repeat(9000), stderr: "", isSuccess: true }).stdout.length, 8000);
});

test("concept unlocking is sequential within a level and independent across levels", () => {
  // 각 레벨의 첫 개념은 항상 열려 있다 (lv1=0, lv2=17, lv3=31)
  assert.equal(isConceptUnlocked(0, []), true);
  assert.equal(isConceptUnlocked(17, []), true);
  assert.equal(isConceptUnlocked(31, []), true);
  // 앞 단계를 클리어해야 다음이 열린다
  assert.equal(isConceptUnlocked(1, []), false);
  assert.equal(isConceptUnlocked(1, [0]), true);
  assert.equal(isConceptUnlocked(2, [0]), false);
  assert.equal(isConceptUnlocked(2, [0, 1]), true);
  // 클리어한 개념은 항상 열려 있다
  assert.equal(isConceptUnlocked(5, [5]), true);
  // 커리큘럼에 없는 개념은 잠긴다
  assert.equal(isConceptUnlocked(999, [0, 1, 2]), false);
});

test("nextConceptId follows level order and stops at level boundaries", () => {
  assert.equal(nextConceptId(0), 1);
  assert.equal(nextConceptId(16), null); // lv1 마지막 → lv2로 넘어가지 않음
  assert.equal(nextConceptId(17), 18);
  assert.equal(nextConceptId(40), null); // lv3 마지막
  assert.equal(nextConceptId(999), null);
});

test("feedback validation accepts optional practiceConceptId", () => {
  const base = { code: "print(1)", stdout: "", stderr: "", isSuccess: true };
  assert.equal(validateFeedback(base).practiceConceptId, null);
  assert.equal(validateFeedback({ ...base, practiceConceptId: null }).practiceConceptId, null);
  assert.equal(validateFeedback({ ...base, practiceConceptId: 12 }).practiceConceptId, 12);
  assert.equal(validateFeedback({ ...base, practiceConceptId: 0 }).practiceConceptId, 0);
  assert.throws(() => validateFeedback({ ...base, practiceConceptId: -1 }), RequestValidationError);
  assert.throws(() => validateFeedback({ ...base, practiceConceptId: 1.5 }), RequestValidationError);
  assert.throws(() => validateFeedback({ ...base, practiceConceptId: "3" }), RequestValidationError);
});
