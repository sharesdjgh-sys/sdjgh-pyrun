CREATE TABLE IF NOT EXISTS "user_concept_practices" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" integer NOT NULL REFERENCES "users"("id"),
  "concept_id" integer NOT NULL REFERENCES "concepts"("id"),
  "practiced_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_concept_practice_unique"
  ON "user_concept_practices" ("user_id", "concept_id");
