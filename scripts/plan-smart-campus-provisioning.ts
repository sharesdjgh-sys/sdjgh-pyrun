import { parseSchoolStudentNumber } from "../lib/student-number";

// 중앙 명부의 C열은 비밀번호다. 계획에는 사용하지 않고 공개 출력에도 싣지 않는다.
export type RosterSnapshot = {
  headers: string[];
  rows: (string | number | null)[][];
  registrationIds: (string | null)[];
};
export type LocalUser = {
  id: number; school_id: number; username: string;
  student_number: string | null; role: string;
};
export type Binding = {
  school_id: number; platform_user_id: string;
  registration_id: string; user_id: number;
};
export type Decision = {
  platformUserId: string; registrationId: string;
  kind: "existing" | "create" | "hold";
  localUserId?: number;
  // 겹치는 앱 계정이 다른 사람의 것이거나 별도 결정으로 퇴역하는 경우,
  // 해당 PK를 모두 열거하고 그 판단의 비공개 근거를 함께 기록한다.
  excludedLocalUserIds?: number[];
  distinctPersonEvidenceRef?: string;
  retiredAccountEvidenceRef?: string;
  specialStudentEvidenceRef?: string;
  reviewedBy?: string; evidenceRef?: string;
};
type Action = {
  kind: "existing" | "create"; platformUserId: string; registrationId: string;
  localUserId?: number; username?: string; studentNumber?: string; displayName?: string;
  role: string; grade?: number; classNumber?: number; seatNumber?: number;
};

const REGISTRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const CURRENT_NUMBER = /^(?:\d{2,4}-)?(\d{5})$/;
// 중앙 명부의 실제 학생 B열 ID는 `입학연도-5자리 번호` 형식이다.
const COHORT_ACCOUNT = /^(\d{2})-\d{5}$/;
const ROLE = new Map([
  ["학생", "student"], ["교사", "teacher"],
  ["업무담당자", "teacher"], ["관리자", "admin"],
]);
const normalize = (value: unknown) => String(value ?? "").normalize("NFKC")
  .trim().toLocaleLowerCase("en-US");

function counts(values: string[]) {
  const result = new Map<string, number>();
  for (const value of values) result.set(value, (result.get(value) ?? 0) + 1);
  return result;
}

function sameNumbers(actual: number[], reviewed: number[]) {
  return actual.length === reviewed.length &&
    actual.every((value, index) => value === reviewed[index]);
}

export function planPyRunProvisioning(snapshot: RosterSnapshot, schoolId: number,
  localUsers: LocalUser[], decisions: Decision[], bindings: Binding[] = []) {
  if (!Number.isSafeInteger(schoolId) || schoolId < 1 ||
      !Array.isArray(snapshot?.headers) || snapshot.headers.length !== 10 ||
      snapshot.headers[1] !== "ID" || snapshot.headers[3] !== "이름" ||
      !snapshot.headers[4].includes("학번") || snapshot.headers[5] !== "권한" ||
      snapshot.headers[6] !== "상태" || !Array.isArray(snapshot.rows) ||
      !Array.isArray(snapshot.registrationIds) ||
      snapshot.rows.length !== snapshot.registrationIds.length ||
      snapshot.rows.length > 100000 ||
      snapshot.rows.some(row => !Array.isArray(row) || row.length > 10) ||
      !Array.isArray(localUsers) || !Array.isArray(decisions) || !Array.isArray(bindings)) {
    throw Error("invalid_provisioning_input");
  }
  const active = snapshot.rows.map((row, index) => ({ row, index,
    role: ROLE.get(String(row[5] ?? "")) })).filter(item =>
    item.row[6] === "Active" && item.role);
  const ids = counts(active.map(item => String(item.row[1] ?? "")));
  const registrations = counts(active.map(item => String(snapshot.registrationIds[item.index] ?? "")));
  const numbers = counts(active.filter(item => item.role === "student")
    .map(item => CURRENT_NUMBER.exec(String(item.row[4] ?? ""))?.[1] ?? "").filter(Boolean));
  const schoolUsers = localUsers.filter(user => user.school_id === schoolId);
  const usersById = new Map(schoolUsers.map(user => [user.id, user]));
  const schoolBindings = bindings.filter(binding => binding.school_id === schoolId);
  if (usersById.size !== schoolUsers.length ||
      new Set(schoolBindings.map(binding => binding.platform_user_id)).size !== schoolBindings.length ||
      new Set(schoolBindings.map(binding => binding.registration_id)).size !== schoolBindings.length ||
      new Set(schoolBindings.map(binding => binding.user_id)).size !== schoolBindings.length) {
    throw Error("invalid_provisioning_input");
  }
  const boundByPlatform = new Map(schoolBindings.map(binding => [binding.platform_user_id, binding]));
  const boundUsers = new Set(schoolBindings.map(binding => binding.user_id));
  const decisionsById = new Map<string, Decision[]>();
  for (const decision of decisions) {
    const group = decisionsById.get(decision?.platformUserId) ?? [];
    group.push(decision);
    decisionsById.set(decision?.platformUserId, group);
  }
  const usedUsers = new Set<number>();
  const actions: Action[] = [];
  const result = { active: active.length, existing: 0, create: 0, hold: 0,
    missingDecision: 0, invalidDecision: 0, collision: 0, existingBinding: 0 };
  const activeIds = new Set(active.map(item => item.row[1]));
  const extraneousDecisions = decisions.filter(item => !activeIds.has(item?.platformUserId)).length;

  for (const { row, index, role } of active) {
    const platformUserId = row[1];
    const registrationId = snapshot.registrationIds[index];
    const group = decisionsById.get(String(platformUserId ?? "")) ?? [];
    if (!group.length) { result.missingDecision++; continue; }
    if (group.length !== 1 || typeof platformUserId !== "string" || !platformUserId ||
        platformUserId !== platformUserId.trim() || platformUserId.length > 200 ||
        ids.get(platformUserId) !== 1 || !REGISTRATION_ID.test(String(registrationId ?? "")) ||
        registrations.get(String(registrationId)) !== 1) {
      result.invalidDecision++; continue;
    }
    const decision = group[0];
    if (decision.registrationId !== registrationId ||
        !["existing", "create", "hold"].includes(decision.kind)) {
      result.invalidDecision++; continue;
    }
    if (decision.kind === "hold") { result.hold++; continue; }
    if (!decision.reviewedBy?.trim() || !decision.evidenceRef?.trim()) {
      result.invalidDecision++; continue;
    }
    const prior = boundByPlatform.get(platformUserId);
    if (prior) {
      if (decision.kind === "existing" && prior.registration_id === registrationId &&
          prior.user_id === decision.localUserId && usersById.has(prior.user_id)) {
        result.existingBinding++;
      } else result.collision++;
      continue;
    }
    if (decision.kind === "existing") {
      const userId = decision.localUserId;
      if (!Number.isSafeInteger(userId) || !usersById.has(userId!) ||
          usedUsers.has(userId!) || boundUsers.has(userId!)) {
        result.collision++; continue;
      }
      usedUsers.add(userId!);
      actions.push({ kind: "existing", platformUserId, registrationId: String(registrationId),
        localUserId: userId, role: role! });
      result.existing++;
      continue;
    }
    const currentUid = String(row[4] ?? "");
    const number = CURRENT_NUMBER.exec(currentUid)?.[1];
    const parsed = number ? parseSchoolStudentNumber(number) : null;
    const cohort = COHORT_ACCOUNT.exec(platformUserId)?.[1];
    const studentNumber = cohort && number ? `${cohort}-${number}` : null;
    const username = `sc-${registrationId}`;
    const candidateIds = schoolUsers.filter(user => {
      const keys = new Set([number, currentUid, platformUserId].map(normalize));
      return keys.has(normalize(user.username)) ||
        (user.student_number !== null && keys.has(normalize(user.student_number)));
    }).map(user => user.id).sort((a, b) => a - b);
    const excluded = decision.excludedLocalUserIds ?? [];
    const reviewedIds = Array.isArray(excluded) ? [...excluded].sort((a, b) => a - b) : [];
    const accountCollision = schoolUsers.some(user =>
      normalize(user.username) === normalize(username));
    const candidateReviewMissing = !sameNumbers(candidateIds, reviewedIds) ||
      (candidateIds.length > 0 && !decision.distinctPersonEvidenceRef?.trim() &&
        !decision.retiredAccountEvidenceRef?.trim());
    const invalidName = typeof row[3] !== "string" || !row[3].trim() || row[3].length > 100;
    // 교직원은 E열 학번을 신원키로 쓰지 않는다. 검토된 중앙 등록 세대에
    // 새 SSO 전용 PK를 발급하고 기존 앱 계정·기록은 그대로 보존한다.
    if (role === "teacher" || role === "admin") {
      if (accountCollision || candidateReviewMissing || invalidName) {
        result.collision++; continue;
      }
      actions.push({ kind: "create", platformUserId, registrationId: String(registrationId),
        username, displayName: row[3] as string, role });
      result.create++;
      continue;
    }
    // 특수 형식 학생은 학년·반·번호를 추측하지 않는다. 사람별 승인 근거가 있을 때만
    // 등록 UUID로 새 SSO 전용 계정을 만들고 과거 앱 계정·기록은 연결하지 않는다.
    const specialFormat = !cohort || !number || !parsed || parsed.grade > 3;
    if (role === "student" && specialFormat && decision.specialStudentEvidenceRef?.trim()) {
      if (invalidName || accountCollision || candidateReviewMissing) {
        result.collision++; continue;
      }
      actions.push({ kind: "create", platformUserId, registrationId: String(registrationId),
        username, displayName: row[3] as string, role: "student" });
      result.create++;
      continue;
    }
    if (role !== "student" || !number || !parsed || parsed.grade > 3 ||
        numbers.get(number) !== 1 ||
        !studentNumber || (currentUid.includes("-") && !currentUid.startsWith(`${cohort}-`)) ||
        invalidName || accountCollision ||
        schoolUsers.some(user => normalize(user.student_number) === normalize(studentNumber)) ||
        candidateReviewMissing) {
      result.collision++; continue;
    }
    // 내부 로그인 ID는 등록 UUID로 고정한다. 표시용 학번은 입학연도와 결합해
    // 과거 5자리 계정의 고유값을 빼앗지 않고 타자연습 교사 화면에 표시한다.
    actions.push({ kind: "create", platformUserId, registrationId: String(registrationId),
      username, studentNumber, displayName: row[3] as string, role: "student", grade: parsed.grade,
      classNumber: parsed.classNumber, seatNumber: parsed.seatNumber });
    result.create++;
  }
  return { mode: "plan-only" as const, applied: false as const, counts: result,
    extraneousDecisions, actions, structurallyReady: result.missingDecision === 0 &&
      result.invalidDecision === 0 && result.collision === 0 && result.hold === 0 &&
      extraneousDecisions === 0 };
}

export function publicPyRunProvisioningSummary(plan: ReturnType<typeof planPyRunProvisioning>) {
  // actions에는 사람별 식별자가 포함된다. 공개 로그에는 집계만 남긴다.
  return { mode: plan.mode, applied: false, counts: plan.counts,
    extraneousDecisions: plan.extraneousDecisions,
    structurallyReady: plan.structurallyReady,
    note: "구조 검증은 동일인 확인이나 운영 적용 승인이 아닙니다." };
}
