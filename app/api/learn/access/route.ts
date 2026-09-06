import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { concepts, userConceptClears, userConceptUnlocks } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const curriculumId = await resolveCurriculumIdForUser(context);
    const [clears, unlocks] = curriculumId ? await Promise.all([
      db.select({ conceptId: userConceptClears.conceptId }).from(userConceptClears)
        .innerJoin(concepts, eq(userConceptClears.conceptId, concepts.id))
        .where(and(eq(userConceptClears.userId, context.userId), eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true))),
      db.select({ conceptId: userConceptUnlocks.conceptId }).from(userConceptUnlocks)
        .innerJoin(concepts, eq(userConceptUnlocks.conceptId, concepts.id))
        .where(and(eq(userConceptUnlocks.userId, context.userId), eq(concepts.curriculumId, curriculumId), eq(concepts.isActive, true))),
    ]) : [[], []];
    return NextResponse.json({
      clearedConceptIds: clears.map((row) => row.conceptId),
      manuallyUnlockedConceptIds: unlocks.map((row) => row.conceptId),
    }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Learning access failed", error);
    return NextResponse.json({ error: "학습 진도를 불러오지 못했습니다." }, { status: 500 });
  }
}
