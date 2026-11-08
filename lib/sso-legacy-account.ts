// 스마트 캠퍼스 SSO의 uid(중앙 명부 E열)로 이 앱의 기존 계정을 고르는 규칙.
//
// 표준 학번 uid(5자리, 입학연도 접두 허용: "10101", "24-10101")는 예전처럼 접두를 떼고
// username과 비교한다. 교직원·특수 형식 uid("T-012" 같은 영문-숫자)는 접두를 떼면
// 숫자만 같은 다른 사람의 계정과 겹친다(교번이 해마다 다시 배정되기도 한다).
// 그래서 표준이 아닌 uid는
//   1) uid 전체와 같은 username 계정,
//   2) 접두를 뗀 예전 username 계정 중 표시 이름이 중앙 이름과 같은 계정
// 만 이어 주고, 나머지는 uid 전체를 username으로 하는 새 계정을 만든다.
// 빈 uid는 여러 사람이 같은 빈 계정을 쓰게 되므로 거부한다.

export const STANDARD_STUDENT_UID = /^(\d{2,4}-)?\d{5}$/;

export function stripUidPrefix(uid: string) {
  const dashIndex = uid.indexOf("-");
  return dashIndex >= 0 ? uid.slice(dashIndex + 1) : uid;
}

const normalizeName = (value: string | null | undefined) =>
  String(value ?? "").normalize("NFKC").replace(/\s+/g, "").toLowerCase();

export function sameDisplayName(a: string | null | undefined, b: string | null | undefined) {
  const left = normalizeName(a);
  return left !== "" && left === normalizeName(b);
}

/** DB에서 먼저 찾아볼 username 후보. 표준 학번은 예전과 같은 한 개뿐이다. */
export function legacySsoUsernameCandidates(uid: string): string[] {
  if (!uid) return [];
  if (STANDARD_STUDENT_UID.test(uid)) return [stripUidPrefix(uid)];
  const legacy = stripUidPrefix(uid);
  return legacy && legacy !== uid ? [uid, legacy] : [uid];
}

export type LegacyAccountRow = { username: string; displayName: string | null };

export type LegacyAccountChoice<T extends LegacyAccountRow> =
  | { kind: "existing"; user: T }
  | { kind: "create"; username: string; studentNumber: string | null }
  | { kind: "reject" };

export function chooseLegacySsoAccount<T extends LegacyAccountRow>(
  identity: { uid: string; name: string; role: string },
  rows: T[],
): LegacyAccountChoice<T> {
  const { uid, name, role } = identity;
  if (!uid) return { kind: "reject" };

  if (STANDARD_STUDENT_UID.test(uid)) {
    // 표준 학번은 현재 운영 규칙과 완전히 같다.
    const key = stripUidPrefix(uid);
    const hit = rows.find((row) => row.username === key);
    return hit ? { kind: "existing", user: hit } : { kind: "create", username: key, studentNumber: key };
  }

  const exact = rows.find((row) => row.username === uid);
  if (exact) return { kind: "existing", user: exact };

  const legacyKey = stripUidPrefix(uid);
  if (legacyKey !== uid) {
    const legacy = rows.find((row) => row.username === legacyKey);
    if (legacy && sameDisplayName(legacy.displayName, name)) return { kind: "existing", user: legacy };
  }

  // uid 전체는 중앙 명부에서 고유하므로 다른 사람의 계정과 겹치지 않는다.
  // 교직원 계정에는 학번을 두지 않아 학번 고유 제약과도 부딪히지 않는다.
  return { kind: "create", username: uid, studentNumber: role === "student" ? uid : null };
}
