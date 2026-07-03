import test from "node:test";
import assert from "node:assert/strict";
import { RequestValidationError, validateFeedback, validateRegistration } from "../lib/api-guard";
import { authenticatedUserId, calculateProgress } from "../lib/progress";

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
