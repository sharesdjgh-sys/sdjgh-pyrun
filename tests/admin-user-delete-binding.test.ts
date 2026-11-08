import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// 실제 관리자 라우트를 가상 DB로 실행해 삭제 전에 어떤 검사가 수행되는지 확인한다.
function routeHarness(options: { bound?: boolean; tableUnavailable?: boolean;
  bindingRequired?: boolean; targetSchoolId?: number } = {}) {
  const schema = {
    users: { id: "users.id", schoolId: "users.schoolId" },
    schools: { id: "schools.id", name: "schools.name" },
    smartCampusUserBindings: { schoolId: "bindings.schoolId", userId: "bindings.userId" },
    feedbackHistory: { userId: "feedback.userId" },
    userConceptClears: { userId: "clears.userId" },
    userConceptPractices: { userId: "practices.userId" },
  };
  type Filter = { column: string; value: unknown };
  const filters: Filter[][] = [];
  const deleted: string[] = [];
  const updated: string[] = [];
  let source: unknown;
  let currentFilters: Filter[] = [];
  const query = {
    from(table: unknown) { source = table; return query; },
    innerJoin() { return query; },
    where(value: Filter | Filter[]) {
      currentFilters = Array.isArray(value) ? value : [value];
      filters.push(currentFilters);
      return query;
    },
    async limit() {
      if (source === schema.smartCampusUserBindings) {
        if (options.tableUnavailable) throw Error("undefined_table");
        return options.bound ? [{ userId: 2 }] : [];
      }
      if (source === schema.users) {
        const scoped = currentFilters.some(item =>
          item.column === "users.schoolId" && item.value === 1);
        return scoped && options.targetSchoolId !== 2 ? [{ id: 2, username: "fictional",
          role: "student", schoolId: 1, grade: 1, classNumber: 1 }] : [];
      }
      return [];
    },
    async orderBy() { return []; },
  };
  const db = {
    select: () => query,
    update: () => ({ set: () => ({ where: () => ({ async returning() {
      updated.push("users");
      return [{ id: 2, role: "teacher" }];
    } }) }) }),
    delete: (table: unknown) => {
      deleted.push(String(table === schema.users ? "users" : "records"));
      return { async where() { return []; } };
    },
  };
  const sourceText = readFileSync("app/api/admin/users/route.ts", "utf8");
  const javascript = ts.transpileModule(sourceText, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    esModuleInterop: true,
  } }).outputText;
  const exports: Record<string, unknown> = {};
  const mocks: Record<string, unknown> = {
    "next/server": { NextResponse: { json: (body: unknown, init?: { status?: number }) =>
      ({ body, status: init?.status ?? 200 }) } },
    "@/lib/auth": { auth: async () => ({ user: { id: "1", schoolId: 1, role: "admin" } }) },
    "@/lib/db/index": { db },
    "@/lib/db/schema": schema,
    "@/lib/class-cleanup": { cleanupEmptyClassAssignments: async () => null },
    "@/lib/curriculum-access": { sessionTenant: () =>
      ({ userId: 1, schoolId: 1, role: "admin" }) },
    "@/lib/roles": { isAdministratorRole: (role: string) => role === "admin",
      isUserRole: (role: string) => ["student", "teacher", "admin"].includes(role) },
    "drizzle-orm": { eq: (column: string, value: unknown) => ({ column, value }),
      and: (...values: Filter[]) => values, asc: (value: unknown) => value },
  };
  vm.runInNewContext(javascript, { exports, console,
    process: { env: { SMART_CAMPUS_REQUIRE_REGISTRATION_BINDING:
      options.bindingRequired ? "true" : "false" } },
    require(name: string) {
      if (!(name in mocks)) throw Error(`Unexpected dependency: ${name}`);
      return mocks[name];
    },
  }, { filename: "app/api/admin/users/route.ts" });
  type Result = { status: number; body: unknown };
  return { route: exports as { DELETE: (request: unknown) => Promise<Result>;
    PATCH: (request: unknown) => Promise<Result>; GET: () => Promise<Result> },
    filters, deleted, updated };
}

const deleteRequest = { json: async () => ({ userId: 2 }) };

test("바인딩 전환 뒤 구형 즉시 삭제는 DB에 접근하기 전에 차단한다", async () => {
  const harness = routeHarness({ bindingRequired: true });
  assert.equal((await harness.route.DELETE(deleteRequest)).status, 409);
  assert.deepEqual(harness.deleted, []);
  assert.deepEqual(harness.filters, []);
});

test("바인딩된 PK와 바인딩 확인 장애는 기록 삭제 전에 거부한다", async () => {
  for (const options of [{ bound: true }, { tableUnavailable: true }]) {
    const harness = routeHarness(options);
    const response = await harness.route.DELETE(deleteRequest);
    assert.equal(response.status, options.bound ? 409 : 503);
    assert.deepEqual(harness.deleted, []);
  }
});

test("중앙 바인딩 계정과 바인딩 확인 장애는 관리자 역할 변경 전에 거부한다", async () => {
  for (const options of [{ bound: true }, { tableUnavailable: true }]) {
    const harness = routeHarness(options);
    const response = await harness.route.PATCH({ json: async () =>
      ({ userId: 2, role: "teacher" }) });
    assert.equal(response.status, options.bound ? 409 : 503);
    assert.deepEqual(harness.updated, []);
  }
});

test("다른 학교의 사용자 조회·삭제·역할 변경을 허용하지 않는다", async () => {
  const harness = routeHarness({ targetSchoolId: 2 });
  assert.equal((await harness.route.DELETE(deleteRequest)).status, 404);
  assert.equal((await harness.route.PATCH({ json: async () =>
    ({ userId: 2, role: "teacher" }) })).status, 404);
  assert.deepEqual(harness.deleted, []);
  assert.ok(harness.filters.some(group => group.some(item =>
    item.column === "users.schoolId" && item.value === 1)));
});
