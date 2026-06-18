import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { userConceptClears, badges, concepts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = Number(session.user.id);

  const allBadges = await db
    .select({
      badgeId: badges.id,
      conceptId: badges.conceptId,
      nameKo: badges.nameKo,
      iconName: badges.iconName,
      colorClass: badges.colorClass,
      conceptNameKo: concepts.nameKo,
      orderIndex: concepts.orderIndex,
    })
    .from(badges)
    .innerJoin(concepts, eq(badges.conceptId, concepts.id))
    .orderBy(concepts.orderIndex);

  const clears = await db
    .select({ conceptId: userConceptClears.conceptId, clearedAt: userConceptClears.clearedAt })
    .from(userConceptClears)
    .where(eq(userConceptClears.userId, userId));

  const clearedMap = new Map(clears.map((c) => [c.conceptId, c.clearedAt]));

  const earned = allBadges.map((b) => ({
    ...b,
    earned: clearedMap.has(b.conceptId),
    clearedAt: clearedMap.get(b.conceptId) ?? null,
  }));

  return NextResponse.json({ earned, totalConcepts: 16 });
}
