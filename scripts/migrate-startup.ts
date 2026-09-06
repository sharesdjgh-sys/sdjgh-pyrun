async function migrate() {

  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.NEON_DATABASE_URL;
    if (!url) throw new Error("NEON_DATABASE_URL is required");

    const sql = neon(url);

    // concepts 테이블에 커리큘럼 컬럼 추가 (없을 때만)
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS example_code text`;
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS practice_code text`;
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1`;
    await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url text`;
    await sql`ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_scale integer NOT NULL DEFAULT 100`;

    await sql`
      CREATE TABLE IF NOT EXISTS data_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;

    const { db } = await import("../lib/db/index");
    const { curriculumSets } = await import("../lib/db/schema");
    const { ensureDefaultMechdogUnits } = await import("../lib/mechdog-access");
    for (const row of await db.select({ id: curriculumSets.id }).from(curriculumSets)) {
      await ensureDefaultMechdogUnits(row.id);
    }
    console.log("[DB] 스키마 및 기본 데이터 준비 완료");
  } catch (e) {
    console.error("[DB] 마이그레이션 실패:", e);
    process.exitCode = 1;
  }
}

void migrate();
