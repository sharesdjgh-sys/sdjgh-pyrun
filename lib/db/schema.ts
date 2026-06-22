import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 10 }).notNull().default("student"),
  displayName: varchar("display_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const concepts = pgTable("concepts", {
  id: serial("id").primaryKey(),
  nameKo: varchar("name_ko", { length: 50 }).notNull(),
  nameEn: varchar("name_en", { length: 50 }).notNull(),
  orderIndex: integer("order_index").notNull(),
  description: text("description"),
});

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
  },
  (table) => ({
    userConceptPracticeUnique: uniqueIndex("user_concept_practice_unique").on(table.userId, table.conceptId),
  })
);

export const feedbackHistory = pgTable("feedback_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  conceptIds: integer("concept_ids").array().notNull().default([]),
  codeSubmitted: text("code_submitted").notNull(),
  outputText: text("output_text"),
  aiFeedback: text("ai_feedback").notNull(),
  isSuccess: boolean("is_success").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
