ALTER TABLE "user_concept_practices"
  ADD COLUMN IF NOT EXISTS "practice_source" varchar(20) NOT NULL DEFAULT 'detected';
