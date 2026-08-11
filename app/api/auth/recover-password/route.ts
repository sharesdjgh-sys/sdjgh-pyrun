import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { rateLimit } from "@/lib/api-guard";
import { db } from "@/lib/db/index";
import { schools, users } from "@/lib/db/schema";

const FAILURE_MESSAGE = "입력한 정보를 확인할 수 없습니다. 복구번호를 잊었다면 선생님께 문의하세요.";
const DUMMY_RECOVERY_HASH = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

export async function POST(req: NextRequest) {
  const globalRate = rateLimit(req, "password-recovery", 30, 15 * 60_000);
  if (!globalRate.allowed) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 15분 후 다시 시도해 주세요." }, {
      status: 429,
      headers: { "Retry-After": String(globalRate.retryAfter) },
    });
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  const schoolCode = typeof body?.schoolCode === "string" ? body.schoolCode.trim().toLowerCase() : "";
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const recoveryCode = typeof body?.recoveryCode === "string" ? body.recoveryCode : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  const accountRate = rateLimit(req, `password-recovery:${schoolCode}:${username}`, 5, 15 * 60_000);
  if (!accountRate.allowed) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 15분 후 다시 시도해 주세요." }, {
      status: 429,
      headers: { "Retry-After": String(accountRate.retryAfter) },
    });
  }

  if (!schoolCode || !username || !/^\d{6}$/.test(recoveryCode) || newPassword.length < 8 || newPassword.length > 128) {
    return NextResponse.json({ error: FAILURE_MESSAGE }, { status: 400 });
  }

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash, recoveryCodeHash: users.recoveryCodeHash })
    .from(users)
    .innerJoin(schools, eq(users.schoolId, schools.id))
    .where(and(eq(schools.code, schoolCode), eq(users.username, username), eq(users.role, "student")))
    .limit(1);

  const recoveryMatches = await bcrypt.compare(recoveryCode, user?.recoveryCodeHash ?? DUMMY_RECOVERY_HASH);
  if (!user?.recoveryCodeHash || !recoveryMatches) {
    return NextResponse.json({ error: FAILURE_MESSAGE }, { status: 400 });
  }
  if (await bcrypt.compare(newPassword, user.passwordHash)) {
    return NextResponse.json({ error: "새 비밀번호는 기존 비밀번호와 다르게 설정해 주세요." }, { status: 400 });
  }

  await db.update(users).set({ passwordHash: await bcrypt.hash(newPassword, 10) }).where(eq(users.id, user.id));
  return NextResponse.json({ ok: true });
}
