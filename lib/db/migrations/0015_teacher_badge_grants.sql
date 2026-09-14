CREATE TABLE IF NOT EXISTS "teacher_badge_grants" (
  "id" serial PRIMARY KEY,
  "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "concept_id" integer NOT NULL REFERENCES "concepts"("id") ON DELETE CASCADE,
  "granted_by_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "granted_at" timestamp DEFAULT now(),
  "celebrated_at" timestamp
);

CREATE UNIQUE INDEX IF NOT EXISTS "teacher_badge_grants_user_concept_unique"
  ON "teacher_badge_grants" ("user_id", "concept_id");

CREATE INDEX IF NOT EXISTS "teacher_badge_grants_user_pending_index"
  ON "teacher_badge_grants" ("user_id", "celebrated_at");
