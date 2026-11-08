import { verifySsoSession } from "./ssoVerify";

export type AuthOrigin = "native-v2" | "smart-campus-v2";

export type OriginToken = Record<string, unknown>;

type BindingIdentity = {
  schoolId: number; localUserId: number; role: string;
  centralUserId: string; registrationId: string;
};

async function isCurrentBinding(identity: BindingIdentity): Promise<boolean> {
  // Edge 미들웨어에서도 실행할 수 있도록 Neon HTTP 연결을 요청 시점에 가져온다.
  const [{ db }, { smartCampusUserBindings, users }, { and, eq }] = await Promise.all([
    import("./db/index"), import("./db/schema"), import("drizzle-orm"),
  ]);
  const rows = await db.select({ role: users.role })
    .from(smartCampusUserBindings)
    .innerJoin(users, and(eq(users.id, smartCampusUserBindings.userId),
      eq(users.schoolId, smartCampusUserBindings.schoolId)))
    .where(and(eq(smartCampusUserBindings.schoolId, identity.schoolId),
      eq(smartCampusUserBindings.platformUserId, identity.centralUserId),
      eq(smartCampusUserBindings.registrationId, identity.registrationId),
      eq(smartCampusUserBindings.userId, identity.localUserId)))
    .limit(2);
  return rows.length === 1 && rows[0].role === identity.role;
}

async function isBoundLocalAccount(localUserId: number, schoolId: number): Promise<boolean> {
  const [{ db }, { smartCampusUserBindings }, { and, eq }] = await Promise.all([
    import("./db/index"), import("./db/schema"), import("drizzle-orm"),
  ]);
  const rows = await db.select({ userId: smartCampusUserBindings.userId })
    .from(smartCampusUserBindings)
    .where(and(eq(smartCampusUserBindings.schoolId, schoolId),
      eq(smartCampusUserBindings.userId, localUserId))).limit(1);
  return rows.length > 0;
}

// 사용자 결정 후 켤 선택지다. 중앙 연결 계정의 자체 비밀번호와 이미 열린 자체 세션을
// 같은 규칙으로 검사하고, 연결표 확인 장애 때에는 접근을 허용하지 않는다.
export async function nativeAccessAllowed(localUserId: number, schoolId: number,
  boundLookup: (localUserId: number, schoolId: number) => Promise<boolean> = isBoundLocalAccount,
  boundAccountsSsoOnly = process.env.PYRUN_BOUND_ACCOUNTS_SSO_ONLY === "true"): Promise<boolean> {
  if (!boundAccountsSsoOnly) return true;
  if (!Number.isSafeInteger(localUserId) || localUserId <= 0 ||
      !Number.isSafeInteger(schoolId) || schoolId <= 0) return false;
  try { return !(await boundLookup(localUserId, schoolId)); }
  catch { return false; }
}

// 이전 Auth.js JWT에는 SSO 출처가 기록되지 않았다. 구 SSO만 골라낼 수 없으므로
// 전환 시 출처가 없는 기존 쿠키는 모두 한 번 재로그인하게 한다. 로컬 학습 기록은 지우지 않는다.
export async function isCurrentAuthToken(token: OriginToken,
  verify: (credential: string, userId: string, registrationId: string, uid: string) => Promise<boolean>
    = verifySsoSession,
  bindingCurrent: (identity: BindingIdentity) => Promise<boolean> = isCurrentBinding,
  nativeAllowed: (localUserId: number, schoolId: number) => Promise<boolean>
    = nativeAccessAllowed): Promise<boolean> {
  if (token.authOrigin === "native-v2") {
    return nativeAllowed(Number(token.userId), Number(token.schoolId));
  }
  if (token.authOrigin !== "smart-campus-v2" ||
      typeof token.ssoCredential !== "string" || !token.ssoCredential ||
      typeof token.centralUserId !== "string" || !token.centralUserId ||
      typeof token.centralRegistrationId !== "string" || !token.centralRegistrationId ||
      typeof token.centralUid !== "string") return false;
  if (!Number.isSafeInteger(token.userId) || Number(token.userId) <= 0 ||
      !Number.isSafeInteger(token.schoolId) || Number(token.schoolId) <= 0 ||
      typeof token.role !== "string" || !token.role) return false;
  try {
    if (!(await verify(token.ssoCredential, token.centralUserId,
      token.centralRegistrationId, token.centralUid))) return false;
    // 연결표에서 PK나 역할이 바뀌면 유효한 중앙 proof만으로 예전 기록을 열 수 없다.
    return await bindingCurrent({ schoolId: Number(token.schoolId),
      localUserId: Number(token.userId), role: token.role,
      centralUserId: token.centralUserId, registrationId: token.centralRegistrationId });
  } catch {
    // 중앙 또는 DB를 확인할 수 없는 동안 소유권을 추정해 허용하지 않는다.
    return false;
  }
}
