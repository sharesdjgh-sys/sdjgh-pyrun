import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cleanupEmptyClassAssignments } from "@/lib/class-cleanup";
import { sessionTenant } from "@/lib/curriculum-access";
import { isAdministratorRole } from "@/lib/roles";

export async function POST() {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  if (!isAdministratorRole(context.role)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const result = await cleanupEmptyClassAssignments(context.schoolId);
  return NextResponse.json(result);
}
