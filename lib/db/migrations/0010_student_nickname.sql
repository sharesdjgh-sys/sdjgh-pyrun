ALTER TABLE "users" ADD COLUMN "nickname" varchar(20);

UPDATE "users"
SET "nickname" = '코드러너'
WHERE "role" = 'student'
  AND ("nickname" IS NULL OR "nickname" = LEFT("display_name", 20));
