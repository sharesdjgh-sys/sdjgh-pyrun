CREATE TABLE IF NOT EXISTS "mechdog_units" (
  "id" serial PRIMARY KEY,
  "curriculum_id" integer NOT NULL REFERENCES "curriculum_sets"("id") ON DELETE CASCADE,
  "created_by_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "name_ko" varchar(50) NOT NULL,
  "name_en" varchar(50) NOT NULL,
  "group_name" varchar(80) NOT NULL DEFAULT '기타',
  "order_index" integer NOT NULL,
  "description" text,
  "example_code" text,
  "is_active" boolean NOT NULL DEFAULT true
);

CREATE INDEX IF NOT EXISTS "mechdog_units_curriculum_order_index"
  ON "mechdog_units" ("curriculum_id", "order_index");

CREATE UNIQUE INDEX IF NOT EXISTS "mechdog_units_curriculum_name_unique"
  ON "mechdog_units" ("curriculum_id", "name_en");
