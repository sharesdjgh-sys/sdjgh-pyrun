import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { feedbackHistory, schools, smartCampusUserBindings, userConceptClears, userConceptPractices, users } from "@/lib/db/schema";
import { cleanupEmptyClassAssignments } from "@/lib/class-cleanup";
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
      studentNumber: users.studentNumber,
      grade: users.grade,
      classNumber: users.classNumber,
      seatNumber: users.seatNumber,
      schoolId: users.schoolId,
      schoolName: schools.name,
    })
    .from(users)
    .innerJoin(schools, eq(users.schoolId, schools.id))
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

  if (role === "admin") {
    return NextResponse.json({ error: "일반 회원이나 교사를 관리자로 변경할 수 없습니다." }, { status: 400 });
  }

  const [targetUser] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  if (isAdministratorRole(targetUser.role)) {
    return NextResponse.json({ error: "관리자 계정의 등급은 변경할 수 없습니다." }, { status: 400 });
  }

  // 중앙 바인딩 계정의 역할은 중앙 명부에서 결정한다. 관리자 화면에서 앱 역할만
  // 고치면 독립 로그인과 SSO가 서로 다른 권한을 보게 되므로 변경을 거부한다.
  let linked: { userId: number } | undefined;
  try {
    [linked] = await db.select({ userId: smartCampusUserBindings.userId })
      .from(smartCampusUserBindings)
      .where(and(eq(smartCampusUserBindings.schoolId, authResult.schoolId),
        eq(smartCampusUserBindings.userId, targetUserId)))
      .limit(1);
  } catch {
    return NextResponse.json({ error: "계정 연결 상태를 확인할 수 없어 권한 변경을 중단했습니다." }, { status: 503 });
  }
  if (linked) {
    return NextResponse.json({ error: "통합 로그인 연결 계정의 권한은 중앙 명부에서 변경하세요." }, { status: 409 });
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

  return NextResponse.json({ user: updatedUser });
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdministrator();
  if ("denied" in authResult) return authResult.denied;

  // 등록 세대 바인딩 전환 뒤에는 이 오래된 즉시 삭제 경로를 사용하지 않는다.
  // 중앙 명부 삭제 미리보기와 별도 확인을 거친 정리 경로가 필요하다.
  if (process.env.SMART_CAMPUS_REQUIRE_REGISTRATION_BINDING === "true") {
    return NextResponse.json({ error: "중앙 계정 정리 화면에서 삭제 대상을 먼저 확인하세요." }, { status: 409 });
  }

  const body = await req.json().catch(() => null);
  const targetUserId = Number(body?.userId);

  if (!Number.isInteger(targetUserId) || targetUserId <= 0) {
    return NextResponse.json({ error: "유효하지 않은 사용자입니다." }, { status: 400 });
  }

  if (targetUserId === authResult.userId) {
    return NextResponse.json({ error: "현재 로그인한 관리자 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  const [targetUser] = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      schoolId: users.schoolId,
      grade: users.grade,
      classNumber: users.classNumber,
    })
    .from(users)
    .where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)))
    .limit(1);

  if (!targetUser) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 });
  }

  // 새 바인딩이 이미 붙은 PK는 구형 단계별 삭제가 FK에서 마지막에 실패할 수 있다.
  // 학습 기록만 먼저 사라지는 일을 막도록 어떤 DELETE보다 앞에서 거부한다.
  let linked: { userId: number } | undefined;
  try {
    [linked] = await db.select({ userId: smartCampusUserBindings.userId })
      .from(smartCampusUserBindings)
      .where(and(eq(smartCampusUserBindings.schoolId, authResult.schoolId),
        eq(smartCampusUserBindings.userId, targetUserId)))
      .limit(1);
  } catch {
    return NextResponse.json({ error: "계정 연결 상태를 확인할 수 없어 삭제를 중단했습니다." }, { status: 503 });
  }
  if (linked) {
    return NextResponse.json({ error: "통합 로그인 연결 계정은 중앙 정리 절차가 필요합니다." }, { status: 409 });
  }

  await db.delete(feedbackHistory).where(eq(feedbackHistory.userId, targetUserId));
  await db.delete(userConceptClears).where(eq(userConceptClears.userId, targetUserId));
  await db.delete(userConceptPractices).where(eq(userConceptPractices.userId, targetUserId));
  await db.delete(users).where(and(eq(users.id, targetUserId), eq(users.schoolId, authResult.schoolId)));

  const cleanup = targetUser.role === "student" && targetUser.grade !== null && targetUser.classNumber !== null
    ? await cleanupEmptyClassAssignments(targetUser.schoolId, {
        grade: targetUser.grade,
        classNumber: targetUser.classNumber,
      })
    : null;

  return NextResponse.json({ ok: true, userId: targetUser.id, username: targetUser.username, cleanup });
}
