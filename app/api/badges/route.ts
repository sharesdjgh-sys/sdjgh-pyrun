import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, badges, concepts } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { and, eq } from "drizzle-orm";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = context.userId;
  const curriculumId = await resolveCurriculumIdForUser(context);
  if (!curriculumId) return NextResponse.json({ earned: [], totalConcepts: 0 });

  try {

  const allBadges = await db
    .select({
      badgeId: badges.id,
      conceptId: badges.conceptId,
      sourceConceptId: concepts.sourceConceptId,
      nameKo: badges.nameKo,
      iconName: badges.iconName,
      colorClass: badges.colorClass,
      conceptNameKo: concepts.nameKo,
      level: concepts.level,
      orderIndex: concepts.orderIndex,
    })
    .from(badges)
    .innerJoin(concepts, eq(badges.conceptId, concepts.id))
    .where(and(eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true)))
    .orderBy(concepts.orderIndex);

  const clears = await db
    .select({ conceptId: userConceptClears.conceptId, clearedAt: userConceptClears.clearedAt })
    .from(userConceptClears)
    .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
    .where(and(
      eq(userConceptClears.userId, userId),
      eq(concepts.curriculumId, curriculumId),
      eq(concepts.isActive, true)
    ));

  const clearedMap = new Map(clears.map((c) => [c.conceptId, c.clearedAt]));

  const earned = allBadges.map((b) => ({
    ...b,
    earned: clearedMap.has(b.conceptId),
    clearedAt: clearedMap.get(b.conceptId) ?? null,
  }));

  const [{ count: totalConcepts }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(concepts)
    .where(and(eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true)));
  return NextResponse.json({ earned, totalConcepts });
  } catch (error) {
    console.error("Badges API error", { userId, error });
    return NextResponse.json({ error: "뱃지 정보를 불러오지 못했습니다." }, { status: 500 });
  }
}
