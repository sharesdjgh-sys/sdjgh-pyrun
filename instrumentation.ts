export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { neon } = await import("@neondatabase/serverless");
    const url = process.env.NEON_DATABASE_URL;
    if (!url) return;

    const sql = neon(url);

    // concepts 테이블에 커리큘럼 컬럼 추가 (없을 때만)
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS example_code text`;
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS practice_code text`;
    await sql`ALTER TABLE concepts ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1`;

    await sql`
      CREATE TABLE IF NOT EXISTS data_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;

    console.log("[DB] 스키마 동기화 완료");
  } catch (e) {
    console.error("[DB] 스키마 동기화 실패:", e);
  }
}
