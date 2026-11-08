const PLATFORM_VERIFY_URL = "https://platform.sdjgh-ai.kr/api/auth/verify";

export async function verifySsoToken(
  authHeader: string | null
): Promise<{ name: string; role: string; uid: string } | null> {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const res = await fetch(PLATFORM_VERIFY_URL, {
      method: "POST",
      signal: AbortSignal.timeout(8000),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const user = data?.user;
    return data?.valid === true && typeof user?.uid === "string" && user.uid.length > 0
      && typeof user.name === "string" && typeof user.role === "string" ? user : null;
  } catch {
    return null;
  }
}
