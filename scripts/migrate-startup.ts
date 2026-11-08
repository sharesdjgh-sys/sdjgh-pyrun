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
    await sql`ALTER TABLE curriculum_sets ADD COLUMN IF NOT EXISTS archived_at timestamp`;

    // 중앙 계정 연결은 학교와 앱 계정의 소유권을 함께 고정한다. 이 스키마가 없으면
    // SSO 수신 단계에서 바로 실패하므로 배포 전에 실행하는 명시적 이관에 포함한다.
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS users_school_id_id_unique ON users(school_id, id)`;
    await sql`
      CREATE TABLE IF NOT EXISTS smart_campus_user_bindings (
        school_id integer NOT NULL REFERENCES schools(id),
        platform_user_id varchar(200) NOT NULL,
        registration_id uuid NOT NULL,
        user_id integer NOT NULL REFERENCES users(id),
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT smart_campus_user_bindings_account_pk PRIMARY KEY (school_id, platform_user_id),
        CONSTRAINT smart_campus_user_bindings_same_school_fk
          FOREIGN KEY (school_id, user_id) REFERENCES users(school_id, id)
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS smart_campus_user_bindings_registration_unique ON smart_campus_user_bindings(school_id, registration_id)`;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS smart_campus_user_bindings_local_user_unique ON smart_campus_user_bindings(user_id)`;

    await sql`
      CREATE TABLE IF NOT EXISTS data_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        content TEXT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_customization_profiles (
        user_id integer PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        active_character varchar(20) NOT NULL DEFAULT 'robot',
        updated_at timestamp DEFAULT now()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS user_cosmetic_items (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_key varchar(80) NOT NULL,
        source varchar(20) NOT NULL,
        earned_at timestamp DEFAULT now()
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_cosmetic_items_user_item_unique ON user_cosmetic_items(user_id, item_key)`;
    await sql`
      CREATE TABLE IF NOT EXISTS user_character_loadouts (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        character_type varchar(20) NOT NULL,
        head_item_key varchar(80),
        face_item_key varchar(80),
        body_item_key varchar(80),
        back_item_key varchar(80),
        updated_at timestamp DEFAULT now()
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS user_character_loadouts_user_character_unique ON user_character_loadouts(user_id, character_type)`;
    await sql`
      CREATE TABLE IF NOT EXISTS cosmetic_reward_grants (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        curriculum_id integer NOT NULL REFERENCES curriculum_sets(id) ON DELETE CASCADE,
        source_type varchar(20) NOT NULL,
        source_key varchar(160) NOT NULL,
        family_key varchar(80),
        selected_character varchar(20),
        item_key varchar(80),
        created_at timestamp DEFAULT now(),
        claimed_at timestamp
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS cosmetic_reward_grants_user_source_unique ON cosmetic_reward_grants(user_id, source_type, source_key)`;
    await sql`
      CREATE TABLE IF NOT EXISTS ai_practice_challenges (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        concept_id integer NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
        title varchar(100) NOT NULL,
        starter_code text NOT NULL,
        expected_output text NOT NULL,
        created_at timestamp DEFAULT now(),
        solved_at timestamp
      )
    `;
    await sql`CREATE INDEX IF NOT EXISTS ai_practice_challenges_user_created_index ON ai_practice_challenges(user_id, created_at)`;
    await sql`
      CREATE TABLE IF NOT EXISTS teacher_badge_grants (
        id serial PRIMARY KEY,
        user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        concept_id integer NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
        granted_by_user_id integer REFERENCES users(id) ON DELETE SET NULL,
        granted_at timestamp DEFAULT now(),
        celebrated_at timestamp
      )
    `;
    await sql`CREATE UNIQUE INDEX IF NOT EXISTS teacher_badge_grants_user_concept_unique ON teacher_badge_grants(user_id, concept_id)`;
    await sql`CREATE INDEX IF NOT EXISTS teacher_badge_grants_user_pending_index ON teacher_badge_grants(user_id, celebrated_at)`;

    const { isNull } = await import("drizzle-orm");
    const { db } = await import("../lib/db/index");
    const { curriculumSets } = await import("../lib/db/schema");
    const { ensureDefaultMechdogUnits } = await import("../lib/mechdog-access");
    for (const row of await db
      .select({ id: curriculumSets.id })
      .from(curriculumSets)
      .where(isNull(curriculumSets.archivedAt))) {
      await ensureDefaultMechdogUnits(row.id);
    }
    console.log("[DB] 스키마 및 기본 데이터 준비 완료");
  } catch (e) {
    console.error("[DB] 마이그레이션 실패:", e);
    process.exitCode = 1;
  }
}

void migrate();
