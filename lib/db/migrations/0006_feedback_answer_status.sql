ALTER TABLE "feedback_history"
  ADD COLUMN IF NOT EXISTS "practice_concept_id" integer;

ALTER TABLE "feedback_history"
  ADD COLUMN IF NOT EXISTS "is_solved" boolean;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'feedback_history_practice_concept_id_concepts_id_fk'
  ) THEN
    ALTER TABLE "feedback_history"
      ADD CONSTRAINT "feedback_history_practice_concept_id_concepts_id_fk"
      FOREIGN KEY ("practice_concept_id")
      REFERENCES "concepts"("id")
      ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "feedback_history_user_created_index"
  ON "feedback_history" ("user_id", "created_at");
