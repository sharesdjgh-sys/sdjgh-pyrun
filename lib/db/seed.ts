import { db } from "./index";
import { concepts, badges } from "./schema";
import { BADGE_METADATA, CONCEPT_EXAMPLES, BADGE_METADATA_LV2, CONCEPT_EXAMPLES_LV2 } from "../curriculum";

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
      exampleCode: example.exampleCode,
      practiceCode: example.practiceCode,
    }).onConflictDoUpdate({
      target: concepts.id,
      set: {
        nameKo: example.nameKo,
        nameEn: example.nameEn,
        orderIndex: badge.conceptId,
        description: example.explanation,
        exampleCode: example.exampleCode,
        practiceCode: example.practiceCode,
      },
    });
  }

  console.log("Seeding badges...");
  for (const badge of BADGE_METADATA) {
    await db.insert(badges).values(badge).onConflictDoUpdate({
      target: badges.conceptId,
      set: { nameKo: badge.nameKo, iconName: badge.iconName, colorClass: badge.colorClass },
    });
  }

  // lv2 concepts 시딩 (level: 2)
  console.log("Seeding lv2 concepts...");
  for (const badge of BADGE_METADATA_LV2) {
    const example = CONCEPT_EXAMPLES_LV2[badge.conceptId];
    await db.insert(concepts).values({
      id: badge.conceptId,
      nameKo: example.nameKo,
      nameEn: example.nameEn,
      orderIndex: badge.conceptId,
      description: example.explanation,
      exampleCode: example.exampleCode,
      practiceCode: example.practiceCode,
      level: 2,
    }).onConflictDoUpdate({
      target: concepts.id,
      set: {
        nameKo: example.nameKo,
        nameEn: example.nameEn,
        orderIndex: badge.conceptId,
        description: example.explanation,
        exampleCode: example.exampleCode,
        practiceCode: example.practiceCode,
        level: 2,
      },
    });
  }

  // lv2 badges 시딩
  console.log("Seeding lv2 badges...");
  for (const badge of BADGE_METADATA_LV2) {
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
