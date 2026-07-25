import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { feedbackHistory, userConceptClears, userConceptPractices, users } from "@/lib/db/schema";
import { sessionTenant } from "@/lib/curriculum-access";
import { isAdministratorRole, isUserRole, type UserRole } from "@/lib/roles";
import { and, asc, eq } from "drizzle-orm";

async function requireAdministrator() {
  const context = sessionTenant(await auth());
  if (!context) {
    return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }

  if (!isAdministratorRole(context.role)) {
    return { denied: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
  }

  return context;
}

export async function GET() {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const rows = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      displayName: users.displayName,
    })
    .from(users)
    .where(eq(users.schoolId, authResult.schoolId))
    .orderBy(asc(users.id));

  return NextResponse.json({ users: rows });
}

export async function PATCH(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const targetUserId = Number(body?.userId);
  const role = body?.role;

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 사용자입니다." }, { status: 400 });
  }

  if (!isUserRole(role)) {
    return NextResponse.json({ error: "유효하지 않은 등급입니다." }, { status: 400 });
  }

  if (targetUserId === authResult.userId && role !== "admin") {
    return NextResponse.json(
      { error: "현재 로그인한 관리자 계정은 관리자 등급을 해제할 수 없습니다." },
      { status: 400 }
    );
  }

  const [updatedUser] = await db
    .update(users)
    .set({ role: role as UserRole })
    .where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)))
    .returning({
      id: users.id,
      username: users.username,
      role: users.role,
      displayName: users.displayName,
    });

  if (!updatedUser) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  const body = await req.json().catch(() => null);
  const targetUserId = Number(body?.userId);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 사용자입니다." }, { status: 400 });
  }

  if (targetUserId === authResult.userId) {
    return NextResponse.json({ error: "현재 로그인한 관리자 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const [targetUser] = await db
    .select({ id: users.id, username: users.username })
    .from(users)
    .where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  await db.delete(feedbackHistory).where(eq(feedbackHistory.userId, targetUserId));
  await db.delete(userConceptClears).where(eq(userConceptClears.userId, targetUserId));
  await db.delete(userConceptPractices).where(eq(userConceptPractices.userId, targetUserId));
  await db.delete(users).where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)));

  return NextResponse.json({ ok: true, userId: targetUser.id, username: targetUser.username });
}
