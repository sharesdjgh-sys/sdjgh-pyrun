import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import {
  getCurriculumUnits,
  resolveCurriculumIdForUser,
  sessionTenant,
} from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const curriculumId = await resolveCurriculumIdForUser(context);
  if (!curriculumId) {
    return NextResponse.json([]);
  }

  const rows = await getCurriculumUnits(curriculumId);
  return NextResponse.json(rows);
}
