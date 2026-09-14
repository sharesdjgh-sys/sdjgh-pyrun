import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { concepts, teacherBadgeGrants, userConceptClears, userConceptUnlocks } from "@/lib/db/schema";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const curriculumId = await resolveCurriculumIdForUser(context);
    const [clears, unlocks, pendingTeacherBadges] = curriculumId ? await Promise.all([
      db.select({ conceptId: userConceptClears.conceptId }).from(userConceptClears)
        .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
        .where(and(eq(userConceptClears.userId, context.userId), eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true))),
      db.select({ conceptId: userConceptUnlocks.conceptId }).from(userConceptUnlocks)
        .innerJoin(concepts, eq(userConceptUnlocks.conceptId, concepts.id))
        .where(and(eq(userConceptUnlocks.userId, context.userId), eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true))),
      db.select({ conceptId: teacherBadgeGrants.conceptId }).from(teacherBadgeGrants)
        .innerJoin(concepts, eq(teacherBadgeGrants.conceptId, concepts.id))
        .where(and(
          eq(teacherBadgeGrants.userId, context.userId),
          isNull(teacherBadgeGrants.celebratedAt),
          eq(concepts.curriculumId, curriculumId),
          eq(concepts.isActive, true)
        )),
    ]) : [[], [], []];
    return NextResponse.json({
      clearedConceptIds: clears.map((row) => row.conceptId),
      manuallyUnlockedConceptIds: unlocks.map((row) => row.conceptId),
      pendingTeacherBadgeIds: pendingTeacherBadges.map((row) => row.conceptId),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Learning access failed", error);
    return NextResponse.json({ error: "학습 진도를 불러오지 못했습니다." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rawConceptIds: unknown[] = Array.isArray(body?.conceptIds) ? body.conceptIds : [];
  const conceptIds = [...new Set(
    rawConceptIds.map((value) => Number(value)).filter((id) => Number.isInteger(id) && id > 0)
  )].slice(0, 50);
  if (conceptIds.length === 0) {
    return NextResponse.json({ error: "확인할 뱃지를 선택해 주세요." }, { status: 400 });
  }

  const acknowledged = await db
    .update(teacherBadgeGrants)
    .set({ celebratedAt: new Date() })
    .where(and(
      eq(teacherBadgeGrants.userId, context.userId),
      isNull(teacherBadgeGrants.celebratedAt),
      inArray(teacherBadgeGrants.conceptId, conceptIds)
    ))
    .returning({ id: teacherBadgeGrants.id });

  return NextResponse.json({ ok: true, acknowledgedCount: acknowledged.length });
}
