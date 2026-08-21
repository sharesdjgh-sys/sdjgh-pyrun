import { and, asc, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { mechdogUnits } from "@/lib/db/schema";
import { MECDOG_EXAMPLES } from "@/lib/mechdog-examples";

export async function ensureDefaultMechdogUnits(curriculumId: number, createdByUserId?: number) {
  const [existing] = await db
    .select({ id: mechdogUnits.id })
    .from(mechdogUnits)
    .where(eq(mechdogUnits.curriculumId, curriculumId))
    .limit(1);

  if (existing) return;

  await db
    .insert(mechdogUnits)
    .values(MECDOG_EXAMPLES.map((example, orderIndex) => ({
      curriculumId,
      createdByUserId,
      nameKo: example.label,
      nameEn: example.id,
      groupName: example.category,
      orderIndex,
      description: example.description,
      exampleCode: example.code,
    })))
    .onConflictDoNothing();
}

export async function getMechdogUnits(curriculumId: number, includeInactive = false) {
  return db
    .select()
    .from(mechdogUnits)
    .where(includeInactive
      ? eq(mechdogUnits.curriculumId, curriculumId)
      : and(eq(mechdogUnits.curriculumId, curriculumId), eq(mechdogUnits.isActive, true)))
    .orderBy(asc(mechdogUnits.orderIndex), asc(mechdogUnits.id));
}
