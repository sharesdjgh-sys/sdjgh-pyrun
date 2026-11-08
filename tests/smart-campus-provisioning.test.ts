import assert from "node:assert/strict";
import test from "node:test";
import { applyPyRunProvisioning } from "../scripts/apply-smart-campus-provisioning";
import { planPyRunProvisioning, publicPyRunProvisioningSummary,
  type Decision, type LocalUser, type RosterSnapshot } from
  "../scripts/plan-smart-campus-provisioning";

const schoolId = 1;
const first = "11111111-1111-4111-8111-111111111111";
const second = "22222222-2222-4222-8222-222222222222";
const existingB = "24-10101";
const newB = "24-10201";
const headers = ["구글 계정", "ID", "비밀번호", "이름", "2026 학번",
  "권한", "상태", "가입일시", "비번변경필요", "업무담당자앱"];
const snapshot: RosterSnapshot = { headers, rows: [
  ["", existingB, "PRIVATE", "합성 기존", "24-10101", "학생", "Active"],
  ["", newB, "PRIVATE", "합성 신규", "24-10201", "학생", "Active"],
], registrationIds: [first, second] };
const localUsers: LocalUser[] = [{ id: 10, school_id: schoolId,
  username: "10101", student_number: "10101", role: "student" }];
const decisions: Decision[] = [
  { platformUserId: existingB, registrationId: first, kind: "existing",
    localUserId: 10, reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거" },
  { platformUserId: newB, registrationId: second, kind: "create",
    reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거" },
];

test("기존 기록 PK를 유지하고 신규 SSO 계정은 학번 재사용과 분리한다", () => {
  const plan = planPyRunProvisioning(snapshot, schoolId, localUsers, decisions);
  assert.equal(plan.structurallyReady, true);
  assert.equal(plan.actions[0].localUserId, 10);
  assert.equal(plan.actions[1].username, `sc-${second}`);
  assert.equal(plan.actions[1].studentNumber, "24-10201");
  assert.equal(plan.actions[1].grade, 1);
  assert.equal(plan.actions[1].classNumber, 2);
  assert.equal(plan.actions[1].seatNumber, 1);
  assert.doesNotMatch(JSON.stringify(publicPyRunProvisioningSummary(plan)),
    /s_school|10101|10201|합성 신규|PRIVATE/);
});

test("재사용 학번의 옛 PK가 있으면 다른 사람이라는 명시적 검토가 필요하다", () => {
  const old = { id: 20, school_id: schoolId,
    username: "10201", student_number: "10201", role: "student" };
  const held = planPyRunProvisioning(snapshot, schoolId, [...localUsers, old], decisions);
  assert.equal(held.counts.collision, 1);
  assert.equal(held.structurallyReady, false);
  const reviewed = planPyRunProvisioning(snapshot, schoolId, [...localUsers, old],
    [decisions[0], { ...decisions[1], excludedLocalUserIds: [20],
      distinctPersonEvidenceRef: "비공개 다른 사람 확인" }]);
  assert.equal(reviewed.structurallyReady, true);
  assert.equal(reviewed.actions[1].username, `sc-${second}`);
  const retired = planPyRunProvisioning(snapshot, schoolId, [...localUsers, old],
    [decisions[0], { ...decisions[1], excludedLocalUserIds: [20],
      retiredAccountEvidenceRef: "과거 계정 정리 결정의 합성 근거" }]);
  assert.equal(retired.structurallyReady, true);
});

test("학년 자리가 9인 운영 예외 학번으로 학생 계정을 자동 생성하지 않는다", () => {
  const exceptional: RosterSnapshot = { headers, rows: [
    ["", "24-90201", "PRIVATE", "합성 예외", "90201", "학생", "Active"],
  ], registrationIds: [first] };
  const plan = planPyRunProvisioning(exceptional, schoolId, [], [{
    platformUserId: "24-90201", registrationId: first, kind: "create",
    reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거",
  }]);
  assert.equal(plan.counts.collision, 1);
  assert.equal(plan.structurallyReady, false);
});

test("검토된 특수 형식 학생은 학번을 추측하지 않고 새 SSO 전용 계정을 만든다", () => {
  const exceptional: RosterSnapshot = { headers, rows: [
    ["", "합성-특수", "PRIVATE", "합성 학생", "7001", "학생", "Active"],
  ], registrationIds: [first] };
  const base: Decision = { platformUserId: "합성-특수", registrationId: first,
    kind: "create", reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거" };
  assert.equal(planPyRunProvisioning(exceptional, schoolId, [], [base]).structurallyReady, false);
  const plan = planPyRunProvisioning(exceptional, schoolId, [], [{ ...base,
    specialStudentEvidenceRef: "비공개 특수 학생 승인" }]);
  assert.equal(plan.structurallyReady, true);
  assert.equal(plan.actions[0].username, `sc-${first}`);
  assert.equal(plan.actions[0].studentNumber, undefined);
  assert.equal(plan.actions[0].grade, undefined);
});

test("교사는 E열 학번 대신 검토된 B열 ID와 앱 PK로 연결한다", () => {
  const teacherB = "합성교사ID";
  const teacher: RosterSnapshot = { headers, rows: [
    ["", teacherB, "PRIVATE", "합성 교사", "T-015", "교사", "Active"],
  ], registrationIds: [first] };
  const plan = planPyRunProvisioning(teacher, schoolId,
    [{ id: 11, school_id: schoolId, username: teacherB,
      student_number: null, role: "admin" }],
    [{ platformUserId: teacherB, registrationId: first, kind: "existing",
      localUserId: 11, reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거" }]);
  assert.equal(plan.structurallyReady, true);
  assert.equal(plan.actions[0].localUserId, 11);
});

test("검토된 교사·관리자는 학번 없이 SSO 전용 계정을 계획하고 기존 PK 충돌을 보류한다", () => {
  for (const role of ["교사", "관리자"]) {
    const staffId = `합성${role}ID`;
    const staff: RosterSnapshot = { headers, rows: [
      ["", staffId, "PRIVATE", `합성 ${role}`, "", role, "Active"],
    ], registrationIds: [first] };
    const reviewed: Decision = { platformUserId: staffId, registrationId: first,
      kind: "create", reviewedBy: "합성 검토자", evidenceRef: "비공개 합성 근거" };
    const plan = planPyRunProvisioning(staff, schoolId, [], [reviewed]);
    assert.equal(plan.structurallyReady, true);
    assert.equal(plan.actions[0].username, `sc-${first}`);
    assert.equal(plan.actions[0].studentNumber, undefined);
    assert.equal(plan.actions[0].role, role === "교사" ? "teacher" : "admin");
    const old = { id: 30, school_id: schoolId, username: staffId,
      student_number: null, role: "teacher" };
    assert.equal(planPyRunProvisioning(staff, schoolId, [old], [reviewed]).structurallyReady,
      false);
    assert.equal(planPyRunProvisioning(staff, schoolId, [old], [{ ...reviewed,
      excludedLocalUserIds: [30], retiredAccountEvidenceRef: "비공개 퇴역 결정" }])
      .structurallyReady, true);
  }
});

function fakePool(failBinding = false, currentUsers: LocalUser[] = localUsers) {
  const calls: { sql: string; params?: unknown[] }[] = [];
  let bindingCount = 0;
  const pool = { calls, released: 0,
    async connect() { return {
      async query(sql: string, params?: unknown[]) {
        calls.push({ sql, params });
        if (sql.startsWith("BEGIN") || sql === "COMMIT" || sql === "ROLLBACK") return { rows: [] };
        if (sql.includes("FROM public.schools")) return { rows: [{ id: schoolId }] };
        if (sql.includes("FROM public.users")) return { rows: currentUsers };
        if (sql.includes("FROM public.smart_campus_user_bindings")) return { rows: [] };
        if (sql.includes("INSERT INTO public.users")) return { rows: [{ id: 21 }] };
        if (sql.includes("INSERT INTO public.smart_campus_user_bindings")) {
          bindingCount++;
          if (failBinding && bindingCount === 2) throw Error("synthetic_unique_conflict");
          return { rows: [{ user_id: params?.[3] }] };
        }
        throw Error("unexpected_sql");
      },
      release() { pool.released++; },
    }; },
  };
  return pool;
}

test("기존 PK 연결과 신규 학생 생성은 같은 트랜잭션에서 완료된다", async () => {
  const pool = fakePool();
  const result = await applyPyRunProvisioning(pool, { schoolId,
    schoolCode: "서대전여고", snapshot, decisions,
    reviewedLocalUsers: localUsers, reviewedBindings: [],
    loadLatestRoster: async () => snapshot });
  assert.equal(result.applied, true);
  assert.equal(result.createdUsers, 1);
  assert.equal(result.insertedBindings, 2);
  assert.equal(pool.calls.at(-1)?.sql, "COMMIT");
  assert.equal(pool.released, 1);
  const insertion = pool.calls.find(call => call.sql.includes("INSERT INTO public.users"));
  assert.equal(insertion?.params?.[1], `sc-${second}`);
  assert.match(String(insertion?.params?.[2]), /^!sso-only!/);
  assert.equal(insertion?.params?.[5], "24-10201");
  assert.doesNotMatch(JSON.stringify(result), /s_school|10101|10201|합성/);
});

test("바인딩 실패 또는 명부 등록 세대 변경 시 전부 롤백한다", async () => {
  const failing = fakePool(true);
  await assert.rejects(applyPyRunProvisioning(failing, { schoolId,
    schoolCode: "서대전여고", snapshot, decisions,
    reviewedLocalUsers: localUsers, reviewedBindings: [],
    loadLatestRoster: async () => snapshot }), /synthetic_unique_conflict/);
  assert.equal(failing.calls.at(-1)?.sql, "ROLLBACK");
  const stale = fakePool();
  await assert.rejects(applyPyRunProvisioning(stale, { schoolId,
    schoolCode: "서대전여고", snapshot, decisions,
    reviewedLocalUsers: localUsers, reviewedBindings: [],
    loadLatestRoster: async () => ({ ...snapshot, registrationIds: [second, first] }) }),
  /roster_snapshot_stale/);
  assert.equal(stale.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(stale.calls.some(call => call.sql.includes("INSERT INTO")), false);
});


test("검토 후 앱 DB 사용자가 바뀌면 새 계정·바인딩 삽입을 거부한다", async () => {
  const changed = fakePool(false, [{ ...localUsers[0], username: "reassigned" }]);
  await assert.rejects(applyPyRunProvisioning(changed, { schoolId,
    schoolCode: "서대전여고", snapshot, decisions,
    reviewedLocalUsers: localUsers, reviewedBindings: [],
    loadLatestRoster: async () => snapshot }), /database_snapshot_stale/);
  assert.equal(changed.calls.at(-1)?.sql, "ROLLBACK");
  assert.equal(changed.calls.some(call => call.sql.includes("INSERT INTO")), false);
});
