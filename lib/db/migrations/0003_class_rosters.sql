ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "student_number" varchar(50);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "grade" integer;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "class_number" integer;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "seat_number" integer;

CREATE UNIQUE INDEX IF NOT EXISTS "users_student_number_unique"
  ON "users" ("student_number");

CREATE TABLE IF NOT EXISTS "teacher_class_assignments" (
  "id" serial PRIMARY KEY NOT NULL,
  "teacher_user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "grade" integer NOT NULL,
  "class_number" integer NOT NULL,
  "created_at" timestamp DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "teacher_class_unique"
  ON "teacher_class_assignments" ("teacher_user_id", "grade", "class_number");
