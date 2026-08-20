ALTER TABLE "schools"
ADD COLUMN IF NOT EXISTS "logo_scale" integer NOT NULL DEFAULT 100;

UPDATE "schools"
SET "logo_scale" = 100
WHERE "logo_scale" < 70 OR "logo_scale" > 140;
