const PLATFORM_VERIFY_URL = process.env.PLATFORM_VERIFY_URL || "https://platform.sdjgh-ai.kr/api/auth/verify";
const APP_ID = "pyrun";

export type SmartCampusUser = {
  userId: string;
  registrationId: string;
  name: string;
  role: string;
  uid: string;
};

type Verification = { user: { userId: string; registrationId?: unknown;
  name?: unknown; role?: unknown; uid?: unknown }; sessionProof: string | null };
const REGISTRATION_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// 최초 교환과 이후의 앱 증명 확인은 같은 중앙 API를 쓴다. 성공 응답도 캐시하지 않아
// 관리자 코드 재발급 뒤 다음 보호 요청에서 기존 자격 버전이 바로 거부되게 한다.
async function verifyWithPlatform(token: string): Promise<Verification | null> {
  try {
    const response = await fetch(PLATFORM_VERIFY_URL, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, appId: APP_ID }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const user = data?.user;
    // 앱 증명에는 이름·학번이 들어 있지 않다. 중앙 B열 ID와 현재 등록 세대가 필요하다.
    if (data?.valid !== true || typeof user?.userId !== "string" || !user.userId) return null;
    return { user, sessionProof: typeof data.sessionProof === "string" && data.sessionProof
      ? data.sessionProof : null };
  } catch {
    // 중앙 서버가 응답하지 않으면 기존 PyRun 쿠키만으로 보호 데이터를 열지 않는다.
    return null;
  }
}

export async function exchangeSsoToken(platformToken: string): Promise<{
  user: SmartCampusUser; sessionProof: string;
} | null> {
  if (!platformToken) return null;
  const verified = await verifyWithPlatform(platformToken);
  if (!verified || typeof verified.user.userId !== "string" ||
      verified.user.userId !== verified.user.userId.trim() || verified.user.userId.length > 200 ||
      typeof verified.user.registrationId !== "string" ||
      !REGISTRATION_ID.test(verified.user.registrationId) || !verified.sessionProof ||
      typeof verified.user.name !== "string" || typeof verified.user.role !== "string" ||
      typeof verified.user.uid !== "string") return null;
  return { user: verified.user as SmartCampusUser, sessionProof: verified.sessionProof };
}

export async function verifySsoSession(credential: string, expectedUserId: string,
  expectedRegistrationId: string, expectedUid: string): Promise<boolean> {
  if (!credential || !expectedUserId || !REGISTRATION_ID.test(expectedRegistrationId) ||
      typeof expectedUid !== "string") return false;
  const verified = await verifyWithPlatform(credential);
  return verified?.user.userId === expectedUserId &&
    verified.user.registrationId === expectedRegistrationId && verified.user.uid === expectedUid;
}
