import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/api-guard";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { badges, concepts, userConceptClears, users } from "@/lib/db/schema";

const PASSWORD_MIN_LENGTH = 8;

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const [user] = await db
    .select({
      displayName: users.displayName,
      nickname: users.nickname,
      studentNumber: users.studentNumber,
      grade: users.grade,
      classNumber: users.classNumber,
      seatNumber: users.seatNumber,
      recoveryCodeSet: sql<boolean>`${users.recoveryCodeHash} is not null`,
    })
    .from(users)
    .where(and(eq(users.id, context.userId), eq(users.schoolId, context.schoolId)))
    .limit(1);

  if (!user) return NextResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });

  const curriculumId = await resolveCurriculumIdForUser(context);
  const earnedBadges = curriculumId
    ? await db
        .select({
          id: badges.id,
          name: badges.nameKo,
          sourceConceptId: concepts.sourceConceptId,
          iconName: badges.iconName,
          colorClass: badges.colorClass,
          clearedAt: userConceptClears.clearedAt,
        })
        .from(userConceptClears)
        .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
        .innerJoin(badges, eq(badges.conceptId, concepts.id))
        .where(and(
          eq(userConceptClears.userId, context.userId),
          eq(concepts.curriculumId, curriculumId),
          eq(concepts.isActive, true)
        ))
        .orderBy(userConceptClears.clearedAt)
    : [];

  const [conceptCount] = curriculumId
    ? await db
        .select({ count: sql<number>`count(*)::int` })
        .from(concepts)
        .where(and(eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true)))
    : [{ count: 0 }];

  return NextResponse.json({
    user,
    badges: earnedBadges,
    badgeSummary: { earned: earnedBadges.length, total: conceptCount.count },
  });
}

export async function PATCH(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rate = rateLimit(req, `account-profile:${context.userId}`, 10, 10 * 60_000);
  if (!rate.allowed) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, {
      status: 429,
      headers: { "Retry-After": String(rate.retryAfter) },
    });
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });

  const nickname = typeof body.nickname === "string" ? body.nickname.trim() : undefined;
  const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
  const recoveryCode = typeof body.recoveryCode === "string" ? body.recoveryCode : "";

  if (nickname !== undefined && (nickname.length < 1 || nickname.length > 20)) {
    return NextResponse.json({ error: "닉네임은 1~20자로 입력해 주세요." }, { status: 400 });
  }
  if (newPassword && (newPassword.length < PASSWORD_MIN_LENGTH || newPassword.length > 128)) {
    return NextResponse.json({ error: "새 비밀번호는 8~128자로 입력해 주세요." }, { status: 400 });
  }
  if (recoveryCode && !/^\d{6}$/.test(recoveryCode)) {
    return NextResponse.json({ error: "복구번호는 숫자 6자리여야 합니다." }, { status: 400 });
  }
  if (nickname === undefined && !newPassword && !recoveryCode) {
    return NextResponse.json({ error: "변경할 내용을 입력해 주세요." }, { status: 400 });
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(and(eq(users.id, context.userId), eq(users.schoolId, context.schoolId)))
    .limit(1);
  if (!user) return NextResponse.json({ error: "계정을 찾을 수 없습니다." }, { status: 404 });

  if ((newPassword || recoveryCode) && !await bcrypt.compare(currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "현재 비밀번호가 올바르지 않습니다." }, { status: 400 });
  }
  if (newPassword && await bcrypt.compare(newPassword, user.passwordHash)) {
    return NextResponse.json({ error: "새 비밀번호는 현재 비밀번호와 다르게 설정해 주세요." }, { status: 400 });
  }

  const update: { nickname?: string; passwordHash?: string; recoveryCodeHash?: string } = {};
  if (nickname !== undefined) update.nickname = nickname;
  if (newPassword) update.passwordHash = await bcrypt.hash(newPassword, 10);
  if (recoveryCode) update.recoveryCodeHash = await bcrypt.hash(recoveryCode, 10);

  await db.update(users).set(update).where(and(eq(users.id, context.userId), eq(users.schoolId, context.schoolId)));
  return NextResponse.json({ ok: true, nickname, recoveryCodeSet: Boolean(recoveryCode) });
}
