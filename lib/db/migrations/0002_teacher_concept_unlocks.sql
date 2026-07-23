CREATE TABLE IF NOT EXISTS "user_concept_unlocks" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "concept_id" integer NOT NULL REFERENCES "concepts"("id") ON DELETE CASCADE,
  "unlocked_by_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "unlocked_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_concept_unlock_unique"
  ON "user_concept_unlocks" ("user_id", "concept_id");
