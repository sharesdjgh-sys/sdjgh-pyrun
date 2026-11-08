import test from "node:test";
import assert from "node:assert/strict";
import {
  chooseLegacySsoAccount,
  legacySsoUsernameCandidates,
} from "../lib/sso-legacy-account";

const row = (username: string, displayName: string | null) => ({ username, displayName });

test("표준 학번은 예전처럼 접두를 떼고 같은 계정을 찾는다", () => {
  assert.deepEqual(legacySsoUsernameCandidates("24-10101"), ["10101"]);
  assert.deepEqual(legacySsoUsernameCandidates("10101"), ["10101"]);
  const hit = row("10101", "다른이름이어도됨");
  // 표준 학번은 이름을 비교하지 않는다(현재 운영 규칙 그대로).
  assert.deepEqual(chooseLegacySsoAccount({ uid: "24-10101", name: "학생", role: "student" }, [hit]),
    { kind: "existing", user: hit });
  assert.deepEqual(chooseLegacySsoAccount({ uid: "10101", name: "학생", role: "student" }, []),
    { kind: "create", username: "10101", studentNumber: "10101" });
});

test("교직원 uid는 숫자만 같은 다른 사람 계정으로 들어가지 않는다", () => {
  assert.deepEqual(legacySsoUsernameCandidates("T-012"), ["T-012", "012"]);
  const other = row("012", "다른선생님");
  assert.deepEqual(chooseLegacySsoAccount({ uid: "T-012", name: "김교사", role: "teacher" }, [other]),
    { kind: "create", username: "T-012", studentNumber: null });
});

test("교직원의 예전 계정은 표시 이름이 같을 때만 이어 준다", () => {
  const mine = row("012", " 김 교사 ");
  assert.deepEqual(chooseLegacySsoAccount({ uid: "T-012", name: "김교사", role: "teacher" }, [mine]),
    { kind: "existing", user: mine });
});

test("uid 전체와 같은 계정이 있으면 그 계정을 먼저 쓴다", () => {
  const full = row("T-012", "아무이름");
  const legacy = row("012", "김교사");
  assert.deepEqual(chooseLegacySsoAccount({ uid: "T-012", name: "김교사", role: "teacher" }, [legacy, full]),
    { kind: "existing", user: full });
});

test("특수 형식 학생도 같은 규칙을 쓰고 새 계정에는 uid 전체를 학번으로 둔다", () => {
  assert.deepEqual(chooseLegacySsoAccount({ uid: "S-005", name: "박학생", role: "student" }, [row("005", "남")]),
    { kind: "create", username: "S-005", studentNumber: "S-005" });
  // 접두 없는 특수 번호(예: 4자리)는 예전과 같은 username을 그대로 찾는다.
  const four = row("1234", "이름무관");
  assert.deepEqual(legacySsoUsernameCandidates("1234"), ["1234"]);
  assert.deepEqual(chooseLegacySsoAccount({ uid: "1234", name: "학생", role: "student" }, [four]),
    { kind: "existing", user: four });
});

test("빈 uid는 거부한다", () => {
  assert.deepEqual(legacySsoUsernameCandidates(""), []);
  assert.deepEqual(chooseLegacySsoAccount({ uid: "", name: "학급", role: "student" }, [row("", null)]),
    { kind: "reject" });
});

test("빈 표시 이름은 같은 이름으로 보지 않는다", () => {
  assert.deepEqual(chooseLegacySsoAccount({ uid: "T-012", name: "", role: "teacher" }, [row("012", "")]),
    { kind: "create", username: "T-012", studentNumber: null });
});
