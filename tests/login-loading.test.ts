import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { exchangeSsoToken } from "../lib/ssoVerify";

// Load real route/provider code in isolation; external services remain test doubles.
function loadModule<T = Record<string, unknown>>(path: string, mocks: Record<string, unknown>, globals: Record<string, unknown> = {}) {
  const source = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports: Record<string, unknown> = {};
  vm.runInNewContext(source, { ...globals, exports, process: { env: { NODE_ENV: "test" } }, console, crypto,
    require(name: string) {
      if (!(name in mocks)) throw new Error(`Unexpected dependency: ${name}`);
      return mocks[name];
    },
  }, { filename: path });
  return exports as T;
}

const schema = {
  users: { id: "users.id", schoolId: "users.schoolId", username: "users.username" },
  schools: { id: "schools.id", code: "schools.code" },
  smartCampusUserBindings: { userId: "bindings.userId", schoolId: "bindings.schoolId",
    platformUserId: "bindings.platformUserId", registrationId: "bindings.registrationId" },
  curriculumSets: { id: "sets.id", name: "sets.name" },
};
const operators = {
  eq: (column: string, value: unknown) => ({ column, value }),
  and: (...conditions: unknown[]) => conditions,
  isNull: (column: string) => ({ column, value: null }),
  inArray: (column: string, value: unknown[]) => ({ column, value }),
};

function providerHarness() {
  type Account = { id: string; schoolId: number };
  type Provider = { authorize: (credentials: Record<string, string>) => Promise<Account | null> };
  type Token = Record<string, unknown>;
  type AuthConfig = { providers: Provider[]; callbacks: {
    jwt: (params: { token: Token; user?: Account | null; trigger?: string; session?: Record<string, unknown> }) => Promise<Token | null>;
    session: (params: { session: { user: Record<string, unknown> }; token: Token }) => Promise<{ user: Record<string, unknown> }>;
  } };
  let config = { providers: [] } as unknown as AuthConfig;
  type Filter = { column: string; value: unknown };
  let filters: Filter[] = [];
  let verifyCalls = 0;
  let sessionAllowed = true;
  let blockedNativeUserId: number | null = null;
  const registrationId = "11111111-1111-4111-8111-111111111111";
  let verified: { userId: string; registrationId: string; uid: string; name: string; role: string } | null =
    { userId: "fictional-B-id", registrationId, uid: "24-10101", name: "학생", role: "학생" };
  const accounts = [
    { id: 1, schoolId: 1, schoolCode: "서대전여고", username: "10101", passwordHash: "first", role: "student", displayName: "학생",
      platformUserId: "fictional-B-id", registrationId },
    { id: 2, schoolId: 2, schoolCode: "다른학교", username: "10101", passwordHash: "second", role: "student",
      platformUserId: "other-school-id", registrationId },
    { id: 3, schoolId: 1, schoolCode: "서대전여고", username: "independent", passwordHash: "native", role: "admin",
      platformUserId: "independent-only", registrationId },
    { id: 4, schoolId: 1, schoolCode: "서대전여고", username: `sc-${registrationId}`,
      passwordHash: "!sso-only!fictional-secret", role: "student",
      platformUserId: "new-sso-only", registrationId },
  ];
  const updates: number[] = [];
  const query = {
    from() { return query; }, innerJoin() { return query; },
    where(value: Filter | Filter[]) { filters = Array.isArray(value) ? value : [value]; return query; },
    async limit() {
      return accounts.filter((account) => filters.every((f: Filter) => {
        if (f.column === "users.username") return account.username === f.value;
        if (f.column === "schools.code") return account.schoolCode === f.value;
        if (f.column === "users.schoolId") return account.schoolId === f.value;
        if (f.column === "bindings.platformUserId") return account.platformUserId === f.value;
        if (f.column === "bindings.registrationId") return account.registrationId === f.value;
        return false;
      })).map((user) => ({ user }));
    },
  };
  const update = { set(values: { role: string }) {
    return { async where(conditions: Filter[]) {
      const id = conditions.find(condition => condition.column === "users.id")?.value;
      const schoolId = conditions.find(condition => condition.column === "users.schoolId")?.value;
      const account = accounts.find(item => item.id === id && item.schoolId === schoolId);
      if (!account) throw new Error("Expected one linked account");
      account.role = values.role;
      updates.push(account.id);
    } };
  } };
  loadModule("lib/auth.ts", {
    "next-auth": (value: AuthConfig) => { config = value; return {}; },
    "next-auth/providers/credentials": (value: unknown) => value,
    "@/lib/db/index": { db: { select: () => query, update: () => update } },
    "@/lib/db/schema": schema, "drizzle-orm": operators,
    "@/lib/ssoVerify": { exchangeSsoToken: async () => {
      verifyCalls++;
      return verified && { user: verified, sessionProof: "fictional-proof" };
    } },
    "@/lib/sso-session": { isCurrentAuthToken: async () => sessionAllowed,
      nativeAccessAllowed: async (userId: number) => userId !== blockedNativeUserId },
    "@/lib/student-number": { currentBoundStudentNumber: () => null },
    "bcryptjs": { compare: async (password: string, hash: string) => password === hash },
  });
  return { providers: config.providers, callbacks: config.callbacks, calls: () => verifyCalls,
    invalidate: () => { verified = null; }, revoke: () => { sessionAllowed = false; },
    blockNativeFor: (userId: number) => { blockedNativeUserId = userId; },
    updateVerified: (patch: Partial<NonNullable<typeof verified>>) => { if (verified) verified = { ...verified, ...patch }; },
    accountRole: (id: number) => accounts.find(account => account.id === id)?.role,
    updatedIds: () => [...updates] };
}

test("direct login selects the other school's same student number without calling SSO", async () => {
  const harness = providerHarness();
  const result = await harness.providers[0].authorize({ schoolCode: "다른학교", username: "10101", password: "second" });
  assert.equal(result?.schoolId, 2);
  assert.equal(result?.id, "2");
  assert.equal(harness.calls(), 0);
  assert.equal(await harness.providers[0].authorize({ schoolCode: "다른학교", username: "10101", password: "first" }), null);
  assert.equal(await harness.providers[0].authorize({ username: "10101", password: "first" }), null);
  assert.equal(await harness.providers[0].authorize({ schoolCode: "서대전여고",
    username: "sc-11111111-1111-4111-8111-111111111111", password: "!sso-only!fictional-secret" }), null);
});

test("bound-account native-login policy blocks the selected PK while an independent account remains usable", async () => {
  const harness = providerHarness();
  harness.blockNativeFor(1);
  assert.equal(await harness.providers[0].authorize({ schoolCode: "서대전여고",
    username: "10101", password: "first" }), null);
  assert.equal((await harness.providers[0].authorize({ schoolCode: "서대전여고",
    username: "independent", password: "native" }))?.id, "3");
  assert.equal((await harness.providers[1].authorize({ ssoToken: "fictional-token" }))?.id, "1");
});

test("SSO verifies on the server and resolves only the platform school account", async () => {
  const harness = providerHarness();
  const result = await harness.providers[1].authorize({ ssoToken: "test-token" });
  assert.equal(result?.schoolId, 1);
  assert.equal(harness.calls(), 1);
  // 같은 5자리 학번이어도 중앙 B ID 또는 등록 세대가 다르면 과거 PK로 연결하지 않는다.
  harness.updateVerified({ userId: "new-B-id" });
  assert.equal(await harness.providers[1].authorize({ ssoToken: "test-token" }), null);
  harness.updateVerified({ userId: "fictional-B-id",
    registrationId: "22222222-2222-4222-8222-222222222222" });
  assert.equal(await harness.providers[1].authorize({ ssoToken: "test-token" }), null);
  harness.updateVerified({ registrationId: "11111111-1111-4111-8111-111111111111", role: "교사" });
  const teacher = await harness.providers[1].authorize({ ssoToken: "test-token" });
  assert.equal(teacher?.id, "1");
  assert.equal((teacher as { role?: string } | null)?.role, "teacher");
  assert.equal(harness.accountRole(1), "teacher");
  assert.equal(harness.accountRole(3), "admin");
  assert.deepEqual(harness.updatedIds(), [1]);
  harness.invalidate();
  assert.equal(await harness.providers[1].authorize({ ssoToken: "invalid" }), null);
});

test("Auth.js stores SSO proof privately and rejects a revoked existing cookie", async () => {
  const harness = providerHarness();
  const user = await harness.providers[1].authorize({ ssoToken: "fictional-platform-token" });
  assert.ok(user);
  const token = await harness.callbacks.jwt({ token: {}, user });
  assert.equal(token?.authOrigin, "smart-campus-v2");
  assert.equal(token?.centralUserId, "fictional-B-id");
  assert.equal(token?.centralRegistrationId, "11111111-1111-4111-8111-111111111111");
  assert.equal(token?.centralUid, "24-10101");
  assert.equal(token?.ssoCredential, "fictional-proof");
  const session = await harness.callbacks.session({ session: { user: {} }, token: token! });
  assert.equal("ssoCredential" in session.user, false);
  harness.revoke();
  assert.equal(await harness.callbacks.jwt({ token: token! }), null);
});

test("SSO verification rejects invalid payloads and network failures", async () => {
  const original = globalThis.fetch;
  try {
    for (const body of [{ valid: false }, { valid: true, user: {
      userId: "fictional-B-id", name: "n", role: "학생"
    }, sessionProof: "fictional-proof" }, { valid: true, user: {
      userId: "fictional-B-id", registrationId: "11111111-1111-4111-8111-111111111111",
      name: "n", role: "학생"
    } }]) {
      globalThis.fetch = async (_input, init) => {
        assert.ok(init?.signal);
        assert.equal(init?.cache, "no-store");
        assert.deepEqual(JSON.parse(String(init?.body)).appId, "pyrun");
        return Response.json(body);
      };
      assert.equal(await exchangeSsoToken("test"), null);
    }
    globalThis.fetch = async () => { throw new Error("network"); };
    assert.equal(await exchangeSsoToken("test"), null);
    assert.equal(await exchangeSsoToken(""), null);
  } finally { globalThis.fetch = original; }
});

test("bootstrap requires authentication and scopes curriculum resolution to the session tenant", async () => {
  type Tenant = { userId: number; schoolId: number; role: string };
  let context: Tenant | null = null;
  let resolvedContext: Tenant | undefined;
  let queried = 0;
  const { GET } = loadModule<{ GET: () => Promise<{ status?: number; body: { curriculumView: { units: unknown[] } }; headers: Record<string, string> }> }>("app/api/learn/bootstrap/route.ts", {
    "@/lib/auth": { auth: async () => ({}) },
    "next/server": { NextResponse: { json: (body: unknown, options: Record<string, unknown> = {}) => ({ body, ...options }) } },
    "@/lib/db/index": { db: { select: () => { queried++; throw new Error("No curriculum should mean no data query"); } } },
    "@/lib/db/schema": schema, "drizzle-orm": operators,
    "@/lib/practice-template": { createStudentPracticeTemplate: (value: string) => value },
    "@/lib/curriculum-access": {
      sessionTenant: () => context,
      resolveCurriculumIdForUser: async (value: Tenant) => { resolvedContext = value; return null; },
      getCurriculumUnits: () => { throw new Error("Unexpected query"); },
    },
    "@/lib/mechdog-access": { getMechdogUnits: () => { throw new Error("Unexpected query"); } },
  });
  assert.equal((await GET()).status, 401);
  assert.equal(queried, 0);
  context = { userId: 2, schoolId: 2, role: "student" };
  const response = await GET();
  assert.equal(resolvedContext, context);
  assert.equal(response.body.curriculumView.units.length, 0);
  assert.equal(response.headers["Cache-Control"], "private, no-store");
});


test("learning access queries use the authenticated user and resolved curriculum only", async () => {
  const filters: unknown[] = [];
  const tenant = { userId: 42, schoolId: 7, role: "student" };
  let authenticated = false;
  const query = {
    from() { return query; }, innerJoin() { return query; },
    async where(value: unknown) { filters.push(value); return [{ conceptId: 100, id: 100 }]; },
  };
  const { GET } = loadModule<{ GET: () => Promise<{ status?: number; body: { clearedConceptIds: number[] }; headers: Record<string, string> }> }>("app/api/learn/access/route.ts", {
    "@/lib/auth": { auth: async () => ({}) },
    "next/server": { NextResponse: { json: (body: unknown, options: Record<string, unknown> = {}) => ({ body, ...options }) } },
    "@/lib/db": { db: { select: () => query } },
    "@/lib/db/schema": {
      concepts: { id: "concept.id", curriculumId: "curriculumId", isActive: "active" },
      userConceptClears: { userId: "userId", conceptId: "clear.conceptId" },
      userConceptUnlocks: { userId: "userId", conceptId: "unlock.conceptId" },
      teacherBadgeGrants: { id: "grant.id", userId: "userId", conceptId: "grant.conceptId", celebratedAt: "grant.celebratedAt" },
    },
    "drizzle-orm": operators,
    "@/lib/roles": { isAdministratorRole: (role: string) => role === "admin" || role === "administrator" },
    "@/lib/curriculum-access": {
      sessionTenant: () => authenticated ? tenant : null,
      resolveCurriculumIdForUser: async (context: unknown) => { assert.equal(context, tenant); return 8; },
    },
  });
  assert.equal((await GET()).status, 401);
  assert.equal(filters.length, 0);
  authenticated = true;
  const result = await GET();
  assert.equal(result.body.clearedConceptIds[0], 100);
  assert.equal(filters.length, 3);
  for (const [index, filter] of filters.entries()) assert.equal(JSON.stringify(filter), JSON.stringify(index === 2 ? [
    { column: "userId", value: 42 },
    { column: "grant.celebratedAt", value: null },
    { column: "curriculumId", value: 8 },
    { column: "active", value: true },
  ] : [
    { column: "userId", value: 42 }, { column: "curriculumId", value: 8 }, { column: "active", value: true },
  ]));
  tenant.role = "admin";
  const adminResult = await GET();
  assert.deepEqual(adminResult.body.clearedConceptIds, [100]);
  assert.equal(filters.length, 4);
  assert.deepEqual(filters[3], [
    { column: "curriculumId", value: 8 }, { column: "active", value: true },
  ]);
});


function guardHarness(embedded: boolean, initialStatus = "pending", refreshedSession: unknown = { user: { id: "1" } }) {
  const effects: Array<() => void> = [];
  let listener: ((event: unknown) => void) | undefined;
  const states: string[] = [];
  const calls: unknown[] = [];
  const navigations: string[] = [];
  const timers: Array<() => void> = [];
  const intervals: Array<() => void> = [];
  const parent = { postMessage() {} };
  const self = {};
  const { default: Guard } = loadModule<{ default: (props: { children: null }) => unknown }>("components/SsoGuard.tsx", {
    react: {
      useState: () => [initialStatus, (value: string) => states.push(value)],
      useEffect: (callback: () => void) => { effects.push(callback); },
    },
    "react/jsx-runtime": { jsx: () => null, jsxs: () => null },
    "next-auth/react": { signIn: async (...args: unknown[]) => { calls.push(args); return { ok: true }; },
      useSession: () => ({ update: async () => refreshedSession }) },
    "next/navigation": { useRouter: () => ({ replace: (url: string) => navigations.push(url), refresh() {} }) },
  }, {
    window: { self, top: embedded ? {} : self, parent, location: { pathname: "/login" },
      addEventListener: (type: string, callback: (event: unknown) => void) => {
        if (type === "message") listener = callback;
      },
      removeEventListener() {},
      setInterval: (callback: () => void) => { intervals.push(callback); return intervals.length; },
      clearInterval() {},
    },
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
    clearTimeout() {},
  });
  Guard({ children: null });
  effects.forEach(effect => effect());
  return { states, calls, navigations, timers, intervals,
    message: (origin: string, source: unknown = parent) => listener?.({ origin, source, data: { type: "sso:token", token: "test" } }),
  };
}

test("direct visits display their login without waiting for any platform message", () => {
  const guard = guardHarness(false);
  assert.equal(guard.states[0], "skipped");
  assert.equal(guard.calls.length, 0);
  assert.equal(guard.timers.length, 0);
});

test("embedded SSO accepts only its parent and signs in once without browser verification", async () => {
  const guard = guardHarness(true);
  guard.message("https://untrusted.example");
  guard.message("https://platform.sdjgh-ai.kr", {});
  assert.equal(guard.calls.length, 0);
  guard.message("https://platform.sdjgh-ai.kr");
  guard.message("https://platform.sdjgh-ai.kr");
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(guard.calls.length, 1);
  assert.equal(guard.navigations[0], "/learn");
  assert.equal(guard.states.at(-1), "done");
});

test("SSO token wait ends with a retryable timeout", () => {
  const guard = guardHarness(true);
  guard.timers[0]();
  guard.message("https://platform.sdjgh-ai.kr");
  assert.equal(guard.states.at(-1), "timeout");
  assert.equal(guard.calls.length, 0);
});

test("an open embedded SSO screen locks after the session refresh is revoked", async () => {
  const guard = guardHarness(true, "done", null);
  assert.equal(guard.intervals.length, 1);
  guard.intervals[0]();
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(guard.states.at(-1), "expired");
});
