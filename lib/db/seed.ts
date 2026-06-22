import { db } from "./index";
import { concepts, badges } from "./schema";
import { BADGE_METADATA, CONCEPT_EXAMPLES } from "../curriculum";

async function seed() {
  console.log("Seeding concepts...");
  for (const badge of BADGE_METADATA) {
    const example = CONCEPT_EXAMPLES[badge.conceptId];
    await db.insert(concepts).values({
      id: badge.conceptId,
      nameKo: example.nameKo,
      nameEn: example.nameEn,
      orderIndex: badge.conceptId,
      description: example.explanation,
    }).onConflictDoUpdate({
      target: concepts.id,
      set: { nameKo: example.nameKo, nameEn: example.nameEn, orderIndex: badge.conceptId, description: example.explanation },
    });
  }

  console.log("Seeding badges...");
  for (const badge of BADGE_METADATA) {
    await db.insert(badges).values(badge).onConflictDoUpdate({
      target: badges.conceptId,
      set: { nameKo: badge.nameKo, iconName: badge.iconName, colorClass: badge.colorClass },
    });
  }
  console.log("Seed complete!");
}

seed().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
