CREATE TABLE IF NOT EXISTS "user_customization_profiles" (
  "user_id" integer PRIMARY KEY REFERENCES "users"("id") ON DELETE CASCADE,
  "active_character" varchar(20) NOT NULL DEFAULT 'robot',
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "user_cosmetic_items" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "item_key" varchar(80) NOT NULL,
  "source" varchar(20) NOT NULL,
  "earned_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_cosmetic_items_user_item_unique"
  ON "user_cosmetic_items" ("user_id", "item_key");

CREATE TABLE IF NOT EXISTS "user_character_loadouts" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "character_type" varchar(20) NOT NULL,
  "head_item_key" varchar(80),
  "face_item_key" varchar(80),
  "body_item_key" varchar(80),
  "back_item_key" varchar(80),
  "updated_at" timestamp DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_character_loadouts_user_character_unique"
  ON "user_character_loadouts" ("user_id", "character_type");

CREATE TABLE IF NOT EXISTS "cosmetic_reward_grants" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "curriculum_id" integer NOT NULL REFERENCES "curriculum_sets"("id") ON DELETE CASCADE,
  "source_type" varchar(20) NOT NULL,
  "source_key" varchar(160) NOT NULL,
  "family_key" varchar(80),
  "selected_character" varchar(20),
  "item_key" varchar(80),
  "created_at" timestamp DEFAULT now(),
  "claimed_at" timestamp
);
CREATE UNIQUE INDEX IF NOT EXISTS "cosmetic_reward_grants_user_source_unique"
  ON "cosmetic_reward_grants" ("user_id", "source_type", "source_key");

CREATE TABLE IF NOT EXISTS "ai_practice_challenges" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "concept_id" integer NOT NULL REFERENCES "concepts"("id") ON DELETE CASCADE,
  "title" varchar(100) NOT NULL,
  "starter_code" text NOT NULL,
  "expected_output" text NOT NULL,
  "created_at" timestamp DEFAULT now(),
  "solved_at" timestamp
);
CREATE INDEX IF NOT EXISTS "ai_practice_challenges_user_created_index"
  ON "ai_practice_challenges" ("user_id", "created_at");
