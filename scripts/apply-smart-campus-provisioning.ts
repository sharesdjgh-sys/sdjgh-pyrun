import { randomUUID } from "node:crypto";
import { planPyRunProvisioning, publicPyRunProvisioningSummary,
  type Binding, type Decision, type LocalUser, type RosterSnapshot } from
  "./plan-smart-campus-provisioning";

// 이 모듈은 호출자가 넘긴 DB 연결과 최신 명부만 사용한다. 운영 실행용 CLI는 없다.
type QueryClient = { query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  release(): void };
type QueryPool = { connect(): Promise<QueryClient> };
const IDENTITY_COLUMNS = [0, 1, 3, 4, 5, 6, 7, 8, 9] as const;

function sameRosterIdentity(reviewed: RosterSnapshot, current: RosterSnapshot) {
  if (!Array.isArray(reviewed?.headers) || !Array.isArray(current?.headers) ||
      !Array.isArray(reviewed.rows) || !Array.isArray(current.rows) ||
      !Array.isArray(reviewed.registrationIds) || !Array.isArray(current.registrationIds) ||
      reviewed.headers.length !== current.headers.length ||
      reviewed.rows.length !== current.rows.length ||
      reviewed.registrationIds.length !== current.registrationIds.length) return false;
  // C열 원문 비밀번호만 비교 대상에서 제외한다. 나머지 A:J·행 순서·등록 UUID는 고정한다.
  return reviewed.headers.every((value, index) => value === current.headers[index]) &&
    reviewed.registrationIds.every((value, index) => value === current.registrationIds[index]) &&
    reviewed.rows.every((row, index) => Array.isArray(row) &&
      Array.isArray(current.rows[index]) && IDENTITY_COLUMNS.every(column =>
        (row[column] ?? "") === (current.rows[index][column] ?? "")));
}

function sameDatabaseRows<T extends object>(reviewed: T[], current: T[], keys: (keyof T)[]) {
  if (!Array.isArray(reviewed) || !Array.isArray(current) || reviewed.length !== current.length) return false;
  const values = (rows: T[]) => rows.map(row => JSON.stringify(keys.map(key => row[key] ?? null)))
    .sort((a, b) => a.localeCompare(b));
  return JSON.stringify(values(reviewed)) === JSON.stringify(values(current));
}

export async function applyPyRunProvisioning(pool: QueryPool, input: {
  schoolId: number; schoolCode: string; snapshot: RosterSnapshot;
  decisions: Decision[]; reviewedLocalUsers: LocalUser[]; reviewedBindings: Binding[];
  loadLatestRoster: () => Promise<RosterSnapshot>;
}) {
  if (typeof pool?.connect !== "function" || !Number.isSafeInteger(input?.schoolId) ||
      input.schoolId < 1 || !input.schoolCode?.trim() ||
      !Array.isArray(input.reviewedLocalUsers) || !Array.isArray(input.reviewedBindings) ||
      typeof input.loadLatestRoster !== "function") {
    throw Error("invalid_provisioning_input");
  }
  const client = await pool.connect();
  let begun = false;
  try {
    await client.query("BEGIN ISOLATION LEVEL SERIALIZABLE");
    begun = true;
    const school = await client.query(`SELECT id FROM public.schools
      WHERE id = $1 AND code = $2 FOR UPDATE`, [input.schoolId, input.schoolCode]);
    if (school.rows.length !== 1) throw Error("school_not_unique");
    const current = await input.loadLatestRoster();
    if (!sameRosterIdentity(input.snapshot, current)) throw Error("roster_snapshot_stale");
    // 같은 트랜잭션에서 사용자·바인딩을 다시 읽는다. 검토 후 DB가 바뀌었으면
    // 새 계획을 통과해야만 한 건이라도 삽입한다.
    const userRows = await client.query(`SELECT id, school_id, username,
      student_number, role FROM public.users WHERE school_id = $1 FOR UPDATE`,
    [input.schoolId]);
    const bindingRows = await client.query(`SELECT school_id, platform_user_id,
      registration_id::text, user_id FROM public.smart_campus_user_bindings
      WHERE school_id = $1 FOR UPDATE`, [input.schoolId]);
    if (!sameDatabaseRows(input.reviewedLocalUsers, userRows.rows as LocalUser[],
      ["id", "school_id", "username", "student_number", "role"]) ||
        !sameDatabaseRows(input.reviewedBindings, bindingRows.rows as Binding[],
          ["school_id", "platform_user_id", "registration_id", "user_id"])) {
      throw Error("database_snapshot_stale");
    }
    const plan = planPyRunProvisioning(input.snapshot, input.schoolId,
      userRows.rows as LocalUser[], input.decisions, bindingRows.rows as Binding[]);
    if (!plan.structurallyReady) throw Error("provisioning_plan_not_ready");

    let createdUsers = 0;
    let insertedBindings = 0;
    for (const action of plan.actions) {
      let userId = action.localUserId;
      if (action.kind === "create") {
        // 알 수 없는 비밀값에 대한 무효 해시 표지다. 자체 로그인에서는 이 표지를
        // 명시적으로 거부하므로 새 SSO 계정에 앱 비밀번호가 생기지 않는다.
        const passwordHash = `!sso-only!${randomUUID()}`;
        const added = await client.query(`INSERT INTO public.users
          (school_id, username, password_hash, role, display_name, student_number,
           grade, class_number, seat_number)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [input.schoolId, action.username, passwordHash, action.role,
          action.displayName, action.studentNumber ?? null, action.grade ?? null,
          action.classNumber ?? null, action.seatNumber ?? null]);
        if (added.rows.length !== 1 || !Number.isSafeInteger(added.rows[0].id)) {
          throw Error("user_insert_failed");
        }
        userId = added.rows[0].id as number;
        createdUsers++;
      }
      if (!Number.isSafeInteger(userId)) throw Error("binding_user_required");
      const linked = await client.query(`INSERT INTO public.smart_campus_user_bindings
        (school_id, platform_user_id, registration_id, user_id)
        VALUES ($1,$2,$3::uuid,$4) RETURNING user_id`,
      [input.schoolId, action.platformUserId, action.registrationId, userId]);
      if (linked.rows.length !== 1 || linked.rows[0].user_id !== userId) {
        throw Error("binding_insert_failed");
      }
      insertedBindings++;
    }
    if (createdUsers !== plan.counts.create || insertedBindings !== plan.actions.length) {
      throw Error("provisioning_count_mismatch");
    }
    await client.query("COMMIT");
    return { ...publicPyRunProvisioningSummary(plan), applied: true,
      createdUsers, insertedBindings };
  } catch (error) {
    if (begun) await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
