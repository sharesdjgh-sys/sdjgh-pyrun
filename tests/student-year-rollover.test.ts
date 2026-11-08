import assert from "node:assert/strict";
import test from "node:test";
import { currentBoundStudentNumber } from "../lib/student-number";

test("같은 중앙 등록 세대의 진급은 같은 입학연도 PK용 학번으로 갱신한다", () => {
  assert.deepEqual(currentBoundStudentNumber("26-10501", "26-10501"),
    { studentNumber: "26-10501", grade: 1, classNumber: 5, seatNumber: 1 });
  assert.deepEqual(currentBoundStudentNumber("26-10501", "20501"),
    { studentNumber: "26-20501", grade: 2, classNumber: 5, seatNumber: 1 });
  assert.deepEqual(currentBoundStudentNumber("26-10501", "2026-30501"),
    { studentNumber: "26-30501", grade: 3, classNumber: 5, seatNumber: 1 });
  assert.equal(currentBoundStudentNumber("27-10501", "10501")?.studentNumber, "27-10501");
});

test("다른 입학연도 또는 잘못된 현재 학번은 이전 학급을 유지하지 않고 거부한다", () => {
  assert.equal(currentBoundStudentNumber("26-10501", "27-20501"), null);
  assert.equal(currentBoundStudentNumber("26-10501", "90501"), null);
  assert.equal(currentBoundStudentNumber("26-10501", undefined), null);
});
