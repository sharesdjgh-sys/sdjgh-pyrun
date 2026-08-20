import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cleanupEmptyClassAssignments } from "@/lib/class-cleanup";
import { sessionTenant } from "@/lib/curriculum-access";
import { isAdministratorRole } from "@/lib/roles";

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdministratorRole(context.role)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const schoolId = Number(body?.schoolId);
  if (!Number.isInteger(schoolId) || schoolId <= 0) {
    return NextResponse.json({ error: "관리할 학교를 선택해 주세요." }, { status: 400 });
  }

  const result = await cleanupEmptyClassAssignments(schoolId);
  return NextResponse.json(result);
}
