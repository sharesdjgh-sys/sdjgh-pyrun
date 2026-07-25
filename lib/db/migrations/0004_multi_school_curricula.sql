CREATE TABLE IF NOT EXISTS "schools" (
  "id" serial PRIMARY KEY,
  "name" varchar(120) NOT NULL,
  "code" varchar(40) NOT NULL UNIQUE,
  "created_at" timestamp DEFAULT now()
);

INSERT INTO "schools" ("id", "name", "code")
VALUES (1, '기본 학교', 'default')
ON CONFLICT ("id") DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('"schools"', 'id'),
  GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "schools"), 1)
);

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "school_id" integer;
UPDATE "users" SET "school_id" = 1 WHERE "school_id" IS NULL;
ALTER TABLE "users" ALTER COLUMN "school_id" SET NOT NULL;
ALTER TABLE "users"
  ADD CONSTRAINT "users_school_id_schools_id_fk"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id");

ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_username_unique";
DROP INDEX IF EXISTS "users_username_unique";
DROP INDEX IF EXISTS "users_student_number_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "users_school_username_unique"
  ON "users" ("school_id", "username");
CREATE UNIQUE INDEX IF NOT EXISTS "users_school_student_number_unique"
  ON "users" ("school_id", "student_number");
CREATE INDEX IF NOT EXISTS "users_school_role_index"
  ON "users" ("school_id", "role");

CREATE TABLE IF NOT EXISTS "curriculum_sets" (
  "id" serial PRIMARY KEY,
  "school_id" integer NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "owner_teacher_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "name" varchar(120) NOT NULL,
  "description" text,
  "is_default" boolean NOT NULL DEFAULT false,
  "created_at" timestamp DEFAULT now(),
  "updated_at" timestamp DEFAULT now()
);

INSERT INTO "curriculum_sets" ("id", "school_id", "name", "description", "is_default")
VALUES (1, 1, '기본 Python 커리큘럼', '기존 41개 단원을 보존한 기본 커리큘럼', true)
ON CONFLICT ("id") DO NOTHING;

SELECT setval(
  pg_get_serial_sequence('"curriculum_sets"', 'id'),
  GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "curriculum_sets"), 1)
);

CREATE INDEX IF NOT EXISTS "curriculum_sets_school_index"
  ON "curriculum_sets" ("school_id");
CREATE INDEX IF NOT EXISTS "curriculum_sets_owner_index"
  ON "curriculum_sets" ("owner_teacher_id");

ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "curriculum_id" integer;
ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "source_concept_id" integer;
ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "created_by_user_id" integer;
ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "group_name" varchar(80) NOT NULL DEFAULT '기타';
ALTER TABLE "concepts" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;

UPDATE "concepts"
SET
  "curriculum_id" = COALESCE("curriculum_id", 1),
  "source_concept_id" = COALESCE("source_concept_id", "id"),
  "group_name" = CASE
    WHEN "id" = 0 THEN '로봇 소개'
    WHEN "id" IN (1, 2, 7, 8, 9, 10) THEN '자료형'
    WHEN "id" IN (3, 4, 5, 6) THEN '연산자'
    WHEN "id" IN (11, 12, 13) THEN '제어문'
    WHEN "id" IN (14, 15, 16) THEN '함수/클래스'
    WHEN "id" IN (17, 18, 19, 20, 21, 22, 23) THEN '자료형(심화)'
    WHEN "id" IN (24, 25, 26) THEN '제어문(심화)'
    WHEN "id" IN (27, 28) THEN '함수/클래스(심화)'
    WHEN "id" IN (29, 30) THEN '예외처리/라이브러리'
    WHEN "id" IN (31, 32) THEN '데이터 탐색'
    WHEN "id" IN (33, 34, 35) THEN '시각화'
    WHEN "id" IN (36, 37) THEN '전처리'
    WHEN "id" IN (38, 39, 40) THEN '기계학습'
    ELSE '기타'
  END
WHERE "curriculum_id" IS NULL OR "source_concept_id" IS NULL;

ALTER TABLE "concepts" ALTER COLUMN "curriculum_id" SET NOT NULL;
ALTER TABLE "concepts"
  ADD CONSTRAINT "concepts_curriculum_id_curriculum_sets_id_fk"
  FOREIGN KEY ("curriculum_id") REFERENCES "curriculum_sets"("id") ON DELETE CASCADE;
ALTER TABLE "concepts"
  ADD CONSTRAINT "concepts_created_by_user_id_users_id_fk"
  FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "concepts_curriculum_order_index"
  ON "concepts" ("curriculum_id", "level", "order_index");

SELECT setval(
  pg_get_serial_sequence('"concepts"', 'id'),
  GREATEST((SELECT COALESCE(MAX("id"), 1) FROM "concepts"), 1)
);

CREATE TABLE IF NOT EXISTS "class_curriculum_assignments" (
  "id" serial PRIMARY KEY,
  "school_id" integer NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
  "grade" integer NOT NULL,
  "class_number" integer NOT NULL,
  "curriculum_id" integer NOT NULL REFERENCES "curriculum_sets"("id") ON DELETE CASCADE,
  "assigned_by_user_id" integer REFERENCES "users"("id") ON DELETE SET NULL,
  "assigned_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "class_curriculum_school_class_unique"
  ON "class_curriculum_assignments" ("school_id", "grade", "class_number");

ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "school_id" integer;
ALTER TABLE "data_files" ADD COLUMN IF NOT EXISTS "uploaded_by_user_id" integer;
UPDATE "data_files" SET "school_id" = 1 WHERE "school_id" IS NULL;
ALTER TABLE "data_files" ALTER COLUMN "school_id" SET NOT NULL;
ALTER TABLE "data_files"
  ADD CONSTRAINT "data_files_school_id_schools_id_fk"
  FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE;
ALTER TABLE "data_files"
  ADD CONSTRAINT "data_files_uploaded_by_user_id_users_id_fk"
  FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "data_files" DROP CONSTRAINT IF EXISTS "data_files_filename_unique";
DROP INDEX IF EXISTS "data_files_filename_unique";
CREATE UNIQUE INDEX IF NOT EXISTS "data_files_school_filename_unique"
  ON "data_files" ("school_id", "filename");
