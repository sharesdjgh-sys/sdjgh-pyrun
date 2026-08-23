const PLATFORM_VERIFY_URL = "https://platform.sdjgh-ai.kr/api/auth/verify";

export async function verifySsoToken(
  authHeader: string | null
): Promise<{ name: string; role: string; uid: string } | null> {
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  try {
    const res = await fetch(PLATFORM_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.valid ? data.user ?? null : null;
  } catch {
    return null;
  }
}
