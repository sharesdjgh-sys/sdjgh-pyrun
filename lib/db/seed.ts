import { ensureDefaultMechdogUnits } from "../mechdog-access";
import { db } from "./index";
import { concepts, badges, curriculumSets, schools } from "./schema";
import { sql } from "drizzle-orm";
import {
  BADGE_METADATA,
  CONCEPT_EXAMPLES,
  BADGE_METADATA_LV2,
  CONCEPT_EXAMPLES_LV2,
  BADGE_METADATA_LV3,
  CONCEPT_EXAMPLES_LV3,
  UNIT_GROUPS_LV1,
  UNIT_GROUPS_LV2,
  UNIT_GROUPS_LV3,
} from "../curriculum";

const DEFAULT_SCHOOL_ID = 1;
const DEFAULT_CURRICULUM_ID = 1;

function groupNameFor(conceptId: number) {
  const groups = conceptId <= 16 ? UNIT_GROUPS_LV1 : conceptId <= 30 ? UNIT_GROUPS_LV2 : UNIT_GROUPS_LV3;
  return groups.find((group) => group.ids.includes(conceptId))?.label ?? "기타";
}

async function seed() {
  await db.insert(schools).values({
    id: DEFAULT_SCHOOL_ID,
    name: "서대전여자고등학교",
    code: "서대전여고",
    logoUrl: "/sdj-logo.png",
  }).onConflictDoUpdate({
    target: schools.id,
    set: { name: "서대전여자고등학교", code: "서대전여고" },
  });

  await db.insert(curriculumSets).values({
    id: DEFAULT_CURRICULUM_ID,
    schoolId: DEFAULT_SCHOOL_ID,
    name: "기본 Python 커리큘럼",
    description: "기본 제공 커리큘럼",
    isDefault: true,
  }).onConflictDoUpdate({
    target: curriculumSets.id,
    set: { name: "기본 Python 커리큘럼", isDefault: true },
  });

  await ensureDefaultMechdogUnits(DEFAULT_CURRICULUM_ID);

  // Robot API 소개 (id=0) 시딩
  const robotIntro = CONCEPT_EXAMPLES[0];
  await db.insert(concepts).values({
    id: 0,
    curriculumId: DEFAULT_CURRICULUM_ID,
    sourceConceptId: 0,
    nameKo: robotIntro.nameKo,
    nameEn: robotIntro.nameEn,
    orderIndex: 0,
    description: robotIntro.explanation,
    exampleCode: robotIntro.exampleCode,
    practiceCode: robotIntro.practiceCode,
    level: 1,
    groupName: groupNameFor(0),
  }).onConflictDoUpdate({
    target: concepts.id,
    set: {
      nameKo: robotIntro.nameKo,
      nameEn: robotIntro.nameEn,
      orderIndex: 0,
      description: robotIntro.explanation,
      exampleCode: robotIntro.exampleCode,
      practiceCode: robotIntro.practiceCode,
      level: 1,
      curriculumId: DEFAULT_CURRICULUM_ID,
      sourceConceptId: 0,
      groupName: groupNameFor(0),
    },
  });

  await db.insert(badges).values({
    conceptId: 0,
    nameKo: "Robot API",
    iconName: "Bot",
    colorClass: "text-purple-500",
  }).onConflictDoUpdate({
    target: badges.conceptId,
    set: { nameKo: "Robot API", iconName: "Bot", colorClass: "text-purple-500" },
  });

  console.log("Seeding concepts...");
  for (const badge of BADGE_METADATA) {
    const example = CONCEPT_EXAMPLES[badge.conceptId];
    await db.insert(concepts).values({
      id: badge.conceptId,
      curriculumId: DEFAULT_CURRICULUM_ID,
      sourceConceptId: badge.conceptId,
      nameKo: example.nameKo,
      nameEn: example.nameEn,
      orderIndex: badge.conceptId,
      description: example.explanation,
      exampleCode: example.exampleCode,
      practiceCode: example.practiceCode,
      groupName: groupNameFor(badge.conceptId),
    }).onConflictDoUpdate({
      target: concepts.id,
      set: {
        nameKo: example.nameKo,
        nameEn: example.nameEn,
        orderIndex: badge.conceptId,
        description: example.explanation,
        exampleCode: example.exampleCode,
        practiceCode: example.practiceCode,
        curriculumId: DEFAULT_CURRICULUM_ID,
        sourceConceptId: badge.conceptId,
        groupName: groupNameFor(badge.conceptId),
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
      curriculumId: DEFAULT_CURRICULUM_ID,
      sourceConceptId: badge.conceptId,
      nameKo: example.nameKo,
      nameEn: example.nameEn,
      orderIndex: badge.conceptId,
      description: example.explanation,
      exampleCode: example.exampleCode,
      practiceCode: example.practiceCode,
      level: 2,
      groupName: groupNameFor(badge.conceptId),
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
        curriculumId: DEFAULT_CURRICULUM_ID,
        sourceConceptId: badge.conceptId,
        groupName: groupNameFor(badge.conceptId),
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

  // lv3 concepts 시딩 (level: 3)
  console.log("Seeding lv3 concepts...");
  for (const badge of BADGE_METADATA_LV3) {
    const example = CONCEPT_EXAMPLES_LV3[badge.conceptId];
    await db.insert(concepts).values({
      id: badge.conceptId,
      curriculumId: DEFAULT_CURRICULUM_ID,
      sourceConceptId: badge.conceptId,
      nameKo: example.nameKo,
      nameEn: example.nameEn,
      orderIndex: badge.conceptId,
      description: example.explanation,
      exampleCode: example.exampleCode,
      practiceCode: example.practiceCode,
      level: 3,
      groupName: groupNameFor(badge.conceptId),
    }).onConflictDoUpdate({
      target: concepts.id,
      set: {
        nameKo: example.nameKo,
        nameEn: example.nameEn,
        orderIndex: badge.conceptId,
        description: example.explanation,
        exampleCode: example.exampleCode,
        practiceCode: example.practiceCode,
        level: 3,
        curriculumId: DEFAULT_CURRICULUM_ID,
        sourceConceptId: badge.conceptId,
        groupName: groupNameFor(badge.conceptId),
      },
    });
  }

  // lv3 badges 시딩
  console.log("Seeding lv3 badges...");
  for (const badge of BADGE_METADATA_LV3) {
    await db.insert(badges).values(badge).onConflictDoUpdate({
      target: badges.conceptId,
      set: { nameKo: badge.nameKo, iconName: badge.iconName, colorClass: badge.colorClass },
    });
  }

  await db.execute(sql`
    SELECT setval(
      pg_get_serial_sequence('"concepts"', 'id'),
      GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "concepts"), 1)
    )
  `);

  console.log("Seed complete!");
}

seed().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
