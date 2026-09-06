import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { verifySsoToken } from "../lib/ssoVerify";

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
  curriculumSets: { id: "sets.id", name: "sets.name" },
};
const operators = { eq: (column: string, value: unknown) => ({ column, value }), and: (...conditions: unknown[]) => conditions };

function providerHarness() {
  type Account = { id: string; schoolId: number };
  type Provider = { authorize: (credentials: Record<string, string>) => Promise<Account | null> };
  let config: { providers: Provider[] } = { providers: [] };
  type Filter = { column: string; value: unknown };
  let filters: Filter[] = [];
  let verifyCalls = 0;
  let verified: { uid: string; name: string; role: string } | null = { uid: "24-10101", name: "학생", role: "학생" };
  const accounts = [
    { id: 1, schoolId: 1, schoolCode: "서대전여고", username: "10101", passwordHash: "first", role: "student" },
    { id: 2, schoolId: 2, schoolCode: "다른학교", username: "10101", passwordHash: "second", role: "student" },
  ];
  const query = {
    from() { return query; }, innerJoin() { return query; },
    where(value: Filter | Filter[]) { filters = Array.isArray(value) ? value : [value]; return query; },
    async limit() {
      return accounts.filter((account) => filters.every((f: Filter) =>
        f.column === "users.username" ? account.username === f.value :
        f.column === "schools.code" ? account.schoolCode === f.value :
        f.column === "users.schoolId" ? account.schoolId === f.value : false
      )).map((user) => ({ user }));
    },
  };
  loadModule("lib/auth.ts", {
    "next-auth": (value: { providers: Provider[] }) => { config = value; return {}; },
    "next-auth/providers/credentials": (value: unknown) => value,
    "@/lib/db/index": { db: { select: () => query } },
    "@/lib/db/schema": schema, "drizzle-orm": operators,
    "@/lib/ssoVerify": { verifySsoToken: async () => { verifyCalls++; return verified; } },
    "@/lib/student-number": { parseSchoolStudentNumber: () => null },
    "bcryptjs": { compare: async (password: string, hash: string) => password === hash },
  });
  return { providers: config.providers, calls: () => verifyCalls, invalidate: () => { verified = null; } };
}

test("direct login selects the other school's same student number without calling SSO", async () => {
  const harness = providerHarness();
  const result = await harness.providers[0].authorize({ schoolCode: "다른학교", username: "10101", password: "second" });
  assert.equal(result?.schoolId, 2);
  assert.equal(result?.id, "2");
  assert.equal(harness.calls(), 0);
  assert.equal(await harness.providers[0].authorize({ schoolCode: "다른학교", username: "10101", password: "first" }), null);
  assert.equal(await harness.providers[0].authorize({ username: "10101", password: "first" }), null);
});

test("SSO verifies on the server and resolves only the platform school account", async () => {
  const harness = providerHarness();
  const result = await harness.providers[1].authorize({ ssoToken: "test-token" });
  assert.equal(result?.schoolId, 1);
  assert.equal(harness.calls(), 1);
  harness.invalidate();
  assert.equal(await harness.providers[1].authorize({ ssoToken: "invalid" }), null);
});

test("SSO verification rejects invalid payloads and network failures", async () => {
  const original = globalThis.fetch;
  try {
    for (const body of [{ valid: false }, { valid: true, user: { uid: "", name: "n", role: "student" } }]) {
      globalThis.fetch = async (_input, init) => {
        assert.ok(init?.signal);
        assert.equal(init?.cache, "no-store");
        return Response.json(body);
      };
      assert.equal(await verifySsoToken("Bearer test"), null);
    }
    globalThis.fetch = async () => { throw new Error("network"); };
    assert.equal(await verifySsoToken("Bearer test"), null);
    assert.equal(await verifySsoToken(null), null);
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
    async where(value: unknown) { filters.push(value); return [{ conceptId: 100 }]; },
  };
  const { GET } = loadModule<{ GET: () => Promise<{ status?: number; body: { clearedConceptIds: number[] }; headers: Record<string, string> }> }>("app/api/learn/access/route.ts", {
    "@/lib/auth": { auth: async () => ({}) },
    "next/server": { NextResponse: { json: (body: unknown, options: Record<string, unknown> = {}) => ({ body, ...options }) } },
    "@/lib/db": { db: { select: () => query } },
    "@/lib/db/schema": {
      concepts: { id: "concept.id", curriculumId: "curriculumId", isActive: "active" },
      userConceptClears: { userId: "userId", conceptId: "clear.conceptId" },
      userConceptUnlocks: { userId: "userId", conceptId: "unlock.conceptId" },
    },
    "drizzle-orm": operators,
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
  assert.equal(filters.length, 2);
  for (const filter of filters) assert.equal(JSON.stringify(filter), JSON.stringify([
    { column: "userId", value: 42 }, { column: "curriculumId", value: 8 }, { column: "active", value: true },
  ]));
});


function guardHarness(embedded: boolean) {
  let effect: (() => void) | undefined;
  let listener: ((event: unknown) => void) | undefined;
  const states: string[] = [];
  const calls: unknown[] = [];
  const navigations: string[] = [];
  const timers: Array<() => void> = [];
  const parent = { postMessage() {} };
  const self = {};
  const { default: Guard } = loadModule<{ default: (props: { children: null }) => unknown }>("components/SsoGuard.tsx", {
    react: {
      useState: () => ["pending", (value: string) => states.push(value)],
      useEffect: (callback: () => void) => { effect = callback; },
    },
    "react/jsx-runtime": { jsx: () => null, jsxs: () => null },
    "next-auth/react": { signIn: async (...args: unknown[]) => { calls.push(args); return { ok: true }; } },
    "next/navigation": { useRouter: () => ({ replace: (url: string) => navigations.push(url), refresh() {} }) },
  }, {
    window: { self, top: embedded ? {} : self, parent, location: { pathname: "/login" },
      addEventListener: (_type: string, callback: (event: unknown) => void) => { listener = callback; },
      removeEventListener() {},
    },
    setTimeout: (callback: () => void) => { timers.push(callback); return timers.length; },
    clearTimeout() {},
  });
  Guard({ children: null });
  effect?.();
  return { states, calls, navigations, timers,
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
