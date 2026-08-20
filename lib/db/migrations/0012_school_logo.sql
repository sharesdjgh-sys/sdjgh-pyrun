ALTER TABLE "schools" ADD COLUMN IF NOT EXISTS "logo_url" text;

UPDATE "schools"
SET "logo_url" = '/sdj-logo.png'
WHERE "code" = '서대전여고' AND "logo_url" IS NULL;
