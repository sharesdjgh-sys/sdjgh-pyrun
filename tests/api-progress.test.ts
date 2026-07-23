import test from "node:test";
import assert from "node:assert/strict";
import { RequestValidationError, validateFeedback, validateRegistration } from "../lib/api-guard";
import { authenticatedUserId, calculateProgress, effectiveConceptAccessIds, isConceptUnlocked, nextConceptId } from "../lib/progress";
import { canManageStudentClass, isStudentRole } from "../lib/roles";
import { parseSchoolStudentNumber } from "../lib/student-number";
import { createStudentPracticeTemplate } from "../lib/practice-template";

test("authentication helper rejects missing and malformed sessions", () => {
  assert.equal(authenticatedUserId(null), null);
  assert.equal(authenticatedUserId({ user: { id: "abc" } }), null);
  assert.equal(authenticatedUserId({ user: { id: "7" } }), 7);
});

test("student-only learning features recognize only the student role", () => {
  assert.equal(isStudentRole("student"), true);
  assert.equal(isStudentRole("teacher"), false);
  assert.equal(isStudentRole("admin"), false);
  assert.equal(isStudentRole(undefined), false);
});

test("teachers can manage only students in their assigned classes", () => {
  const assignments = [{ grade: 2, classNumber: 3 }, { grade: 3, classNumber: 1 }];
  assert.equal(canManageStudentClass("teacher", assignments, 2, 3), true);
  assert.equal(canManageStudentClass("teacher", assignments, 2, 4), false);
  assert.equal(canManageStudentClass("teacher", assignments, null, null), false);
  assert.equal(canManageStudentClass("admin", [], 6, 9), true);
  assert.equal(canManageStudentClass("student", assignments, 2, 3), false);
});

test("five-digit school student numbers contain grade, class and seat", () => {
  assert.deepEqual(parseSchoolStudentNumber("10501"), { grade: 1, classNumber: 5, seatNumber: 1 });
  assert.deepEqual(parseSchoolStudentNumber("31227"), { grade: 3, classNumber: 12, seatNumber: 27 });
  assert.equal(parseSchoolStudentNumber("1051"), null);
  assert.equal(parseSchoolStudentNumber("10001"), null);
  assert.equal(parseSchoolStudentNumber("10500"), null);
  assert.equal(parseSchoolStudentNumber("A0501"), null);
});

test("student practice templates keep guidance but remove completed answers", () => {
  const completedPractice = `# 문제: 넓이를 계산하세요.
# 힌트: width * height

import robot
width = 5
height = 3
area = width * height
print(area)
robot.say(str(area))`;
  const starter = createStudentPracticeTemplate(completedPractice);

  assert.match(starter, /# 문제: 넓이를 계산하세요/);
  assert.match(starter, /# 힌트: width \* height/);
  assert.match(starter, /import robot/);
  assert.doesNotMatch(starter, /width = 5/);
  assert.doesNotMatch(starter, /area = width \* height/);
  assert.doesNotMatch(starter, /print\(area\)/);
});

test("explicit blank exercises keep their starter scaffold", () => {
  const blankPractice = `import pandas as pd
df = load_data('titanic')
# 평균을 구하세요.
print(df['Age'].___())`;
  assert.equal(createStudentPracticeTemplate(blankPractice), blankPractice);
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
  // 로봇 소개와 각 레벨의 첫 학습 개념은 항상 열려 있다 (lv1=1, lv2=17, lv3=31)
  assert.equal(isConceptUnlocked(0, []), true);
  assert.equal(isConceptUnlocked(1, []), true);
  assert.equal(isConceptUnlocked(17, []), true);
  assert.equal(isConceptUnlocked(31, []), true);
  // 앞 단계를 클리어해야 다음이 열린다
  assert.equal(isConceptUnlocked(2, [0]), false);
  assert.equal(isConceptUnlocked(2, [1]), true);
  // LV1은 화면의 단원 순서를 따른다 (자료형의 마지막인 10 다음에 연산자 3)
  assert.equal(isConceptUnlocked(3, [1, 2, 7, 8, 9]), false);
  assert.equal(isConceptUnlocked(3, [1, 2, 7, 8, 9, 10]), true);
  // 클리어한 개념은 항상 열려 있다
  assert.equal(isConceptUnlocked(5, [5]), true);
  // 커리큘럼에 없는 개념은 잠긴다
  assert.equal(isConceptUnlocked(999, [0, 1, 2]), false);
});

test("nextConceptId follows level order and stops at level boundaries", () => {
  assert.equal(nextConceptId(0), 1); // 로봇 소개 다음 안내는 LV1 첫 학습인 출력
  assert.equal(nextConceptId(1), 2);
  assert.equal(nextConceptId(10), 3); // 화면의 다음 단원인 연산자로 이동
  assert.equal(nextConceptId(16), null); // lv1 마지막 → lv2로 넘어가지 않음
  assert.equal(nextConceptId(17), 18);
  assert.equal(nextConceptId(40), null); // lv3 마지막
  assert.equal(nextConceptId(999), null);
});

test("teacher unlock overrides prerequisites without awarding completion", () => {
  const clearedIds = [1];
  const accessIds = effectiveConceptAccessIds(clearedIds, [7]);

  assert.deepEqual(clearedIds, [1]);
  assert.equal(accessIds.has(2), true);
  assert.equal(accessIds.has(7), true);
  assert.equal(isConceptUnlocked(7, accessIds), true);
  assert.equal(isConceptUnlocked(8, accessIds), true);
  assert.equal(isConceptUnlocked(9, accessIds), false);
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
