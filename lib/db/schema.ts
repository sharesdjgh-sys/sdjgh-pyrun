import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  code: varchar("code", { length: 40 }).notNull().unique(),
  logoUrl: text("logo_url"),
  logoScale: integer("logo_scale").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow(),
});

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
      .notNull()
      .references(() => schools.id),
    username: varchar("username", { length: 50 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    recoveryCodeHash: text("recovery_code_hash"),
    role: varchar("role", { length: 20 }).notNull().default("student"),
    displayName: varchar("display_name", { length: 100 }),
    nickname: varchar("nickname", { length: 20 }),
    studentNumber: varchar("student_number", { length: 50 }),
    grade: integer("grade"),
    classNumber: integer("class_number"),
    seatNumber: integer("seat_number"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    studentNumberUnique: uniqueIndex("users_school_student_number_unique").on(table.schoolId, table.studentNumber),
    schoolUsernameUnique: uniqueIndex("users_school_username_unique").on(table.schoolId, table.username),
    schoolRoleIndex: index("users_school_role_index").on(table.schoolId, table.role),
  })
);

export const teacherClassAssignments = pgTable(
  "teacher_class_assignments",
  {
    id: serial("id").primaryKey(),
    teacherUserId: integer("teacher_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    grade: integer("grade").notNull(),
    classNumber: integer("class_number").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    teacherClassUnique: uniqueIndex("teacher_class_unique").on(
      table.teacherUserId,
      table.grade,
      table.classNumber
    ),
  })
);

export const curriculumSets = pgTable(
  "curriculum_sets",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    ownerTeacherId: integer("owner_teacher_id").references(() => users.id, { onDelete: "set null" }),
    name: varchar("name", { length: 120 }).notNull(),
    description: text("description"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    schoolIndex: index("curriculum_sets_school_index").on(table.schoolId),
    ownerIndex: index("curriculum_sets_owner_index").on(table.ownerTeacherId),
  })
);

export const concepts = pgTable(
  "concepts",
  {
    id: serial("id").primaryKey(),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curriculumSets.id, { onDelete: "cascade" }),
    sourceConceptId: integer("source_concept_id"),
    createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    nameKo: varchar("name_ko", { length: 50 }).notNull(),
    nameEn: varchar("name_en", { length: 50 }).notNull(),
    groupName: varchar("group_name", { length: 80 }).notNull().default("기타"),
    orderIndex: integer("order_index").notNull(),
    description: text("description"),
    level: integer("level").notNull().default(1),
    exampleCode: text("example_code"),
    practiceCode: text("practice_code"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    curriculumOrderIndex: index("concepts_curriculum_order_index").on(
      table.curriculumId,
      table.level,
      table.orderIndex
    ),
  })
);

export const mechdogUnits = pgTable(
  "mechdog_units",
  {
    id: serial("id").primaryKey(),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curriculumSets.id, { onDelete: "cascade" }),
    createdByUserId: integer("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
    nameKo: varchar("name_ko", { length: 50 }).notNull(),
    nameEn: varchar("name_en", { length: 50 }).notNull(),
    groupName: varchar("group_name", { length: 80 }).notNull().default("기타"),
    orderIndex: integer("order_index").notNull(),
    description: text("description"),
    exampleCode: text("example_code"),
    isActive: boolean("is_active").notNull().default(true),
  },
  (table) => ({
    curriculumOrderIndex: index("mechdog_units_curriculum_order_index").on(
      table.curriculumId,
      table.orderIndex
    ),
    curriculumNameUnique: uniqueIndex("mechdog_units_curriculum_name_unique").on(
      table.curriculumId,
      table.nameEn
    ),
  })
);

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  conceptId: integer("concept_id")
    .notNull()
    .references(() => concepts.id)
    .unique(),
  nameKo: varchar("name_ko", { length: 100 }).notNull(),
  iconName: varchar("icon_name", { length: 50 }).notNull(),
  colorClass: varchar("color_class", { length: 50 }).notNull(),
});

export const userConceptClears = pgTable(
  "user_concept_clears",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    conceptId: integer("concept_id")
      .notNull()
      .references(() => concepts.id),
    clearedAt: timestamp("cleared_at").defaultNow(),
  },
  (table) => ({
    userConceptUnique: uniqueIndex("user_concept_unique").on(
      table.userId,
      table.conceptId
    ),
  })
);

// Browser execution is useful practice evidence, but is not a trusted completion.
export const userConceptPractices = pgTable(
  "user_concept_practices",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id),
    conceptId: integer("concept_id").notNull().references(() => concepts.id),
    practicedAt: timestamp("practiced_at").defaultNow(),
    practiceSource: varchar("practice_source", { length: 20 }).notNull().default("detected"),
  },
  (table) => ({
    userConceptPracticeUnique: uniqueIndex("user_concept_practice_unique").on(table.userId, table.conceptId),
  })
);

// A teacher can open a concept for an individual student without marking it as completed.
export const userConceptUnlocks = pgTable(
  "user_concept_unlocks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id")
      .notNull()
      .references(() => concepts.id, { onDelete: "cascade" }),
    unlockedByUserId: integer("unlocked_by_user_id").references(() => users.id, { onDelete: "set null" }),
    unlockedAt: timestamp("unlocked_at").defaultNow(),
  },
  (table) => ({
    userConceptUnlockUnique: uniqueIndex("user_concept_unlock_unique").on(table.userId, table.conceptId),
  })
);

export const classCurriculumAssignments = pgTable(
  "class_curriculum_assignments",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    grade: integer("grade").notNull(),
    classNumber: integer("class_number").notNull(),
    curriculumId: integer("curriculum_id")
      .notNull()
      .references(() => curriculumSets.id, { onDelete: "cascade" }),
    assignedByUserId: integer("assigned_by_user_id").references(() => users.id, { onDelete: "set null" }),
    assignedAt: timestamp("assigned_at").defaultNow(),
  },
  (table) => ({
    schoolClassUnique: uniqueIndex("class_curriculum_school_class_unique").on(
      table.schoolId,
      table.grade,
      table.classNumber
    ),
  })
);

export const dataFiles = pgTable(
  "data_files",
  {
    id: serial("id").primaryKey(),
    schoolId: integer("school_id")
      .notNull()
      .references(() => schools.id, { onDelete: "cascade" }),
    uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id, { onDelete: "set null" }),
    filename: varchar("filename", { length: 255 }).notNull(),
    content: text("content").notNull(),
    uploadedAt: timestamp("uploaded_at").defaultNow(),
  },
  (table) => ({
    schoolFilenameUnique: uniqueIndex("data_files_school_filename_unique").on(table.schoolId, table.filename),
  })
);

export const feedbackHistory = pgTable(
  "feedback_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    conceptIds: integer("concept_ids").array().notNull().default([]),
    practiceConceptId: integer("practice_concept_id").references(() => concepts.id, { onDelete: "set null" }),
    codeSubmitted: text("code_submitted").notNull(),
    outputText: text("output_text"),
    aiFeedback: text("ai_feedback").notNull(),
    isSuccess: boolean("is_success").notNull(),
    isSolved: boolean("is_solved"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    userCreatedIndex: index("feedback_history_user_created_index").on(table.userId, table.createdAt),
  })
);

export const userCustomizationProfiles = pgTable("user_customization_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  activeCharacter: varchar("active_character", { length: 20 }).notNull().default("robot"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userCosmeticItems = pgTable(
  "user_cosmetic_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    itemKey: varchar("item_key", { length: 80 }).notNull(),
    source: varchar("source", { length: 20 }).notNull(),
    earnedAt: timestamp("earned_at").defaultNow(),
  },
  (table) => ({
    userItemUnique: uniqueIndex("user_cosmetic_items_user_item_unique").on(table.userId, table.itemKey),
  })
);

export const userCharacterLoadouts = pgTable(
  "user_character_loadouts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    characterType: varchar("character_type", { length: 20 }).notNull(),
    headItemKey: varchar("head_item_key", { length: 80 }),
    faceItemKey: varchar("face_item_key", { length: 80 }),
    bodyItemKey: varchar("body_item_key", { length: 80 }),
    backItemKey: varchar("back_item_key", { length: 80 }),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    userCharacterUnique: uniqueIndex("user_character_loadouts_user_character_unique").on(table.userId, table.characterType),
  })
);

export const cosmeticRewardGrants = pgTable(
  "cosmetic_reward_grants",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    curriculumId: integer("curriculum_id").notNull().references(() => curriculumSets.id, { onDelete: "cascade" }),
    sourceType: varchar("source_type", { length: 20 }).notNull(),
    sourceKey: varchar("source_key", { length: 160 }).notNull(),
    familyKey: varchar("family_key", { length: 80 }),
    selectedCharacter: varchar("selected_character", { length: 20 }),
    itemKey: varchar("item_key", { length: 80 }),
    createdAt: timestamp("created_at").defaultNow(),
    claimedAt: timestamp("claimed_at"),
  },
  (table) => ({
    userRewardUnique: uniqueIndex("cosmetic_reward_grants_user_source_unique").on(table.userId, table.sourceType, table.sourceKey),
  })
);

export const aiPracticeChallenges = pgTable(
  "ai_practice_challenges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    conceptId: integer("concept_id").notNull().references(() => concepts.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 100 }).notNull(),
    starterCode: text("starter_code").notNull(),
    expectedOutput: text("expected_output").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    solvedAt: timestamp("solved_at"),
  },
  (table) => ({
    userCreatedIndex: index("ai_practice_challenges_user_created_index").on(table.userId, table.createdAt),
  })
);
