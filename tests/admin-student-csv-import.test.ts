import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

// 실제 CSV 라우트를 가상 DB로 실행해 기존 PK 덮어쓰기와 부분 삽입을 막는지 확인한다.
function routeHarness(existing = false) {
  const inserted: unknown[][] = [];
  const schema = { users: { schoolId: "schoolId", username: "username", studentNumber: "studentNumber" } };
  const db = {
    select: () => ({ from: () => ({ where: async () => existing ? [{ id: 1 }] : [] }) }),
    insert: () => ({ values: async (rows: unknown[]) => { inserted.push(rows); } }),
  };
  const source = readFileSync("app/api/admin/students/import/route.ts", "utf8");
  const javascript = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const exports: Record<string, unknown> = {};
  const mocks: Record<string, unknown> = {
    "next/server": { NextResponse: { json: (body: unknown, init?: { status?: number }) =>
      ({ body, status: init?.status ?? 200 }) } },
    "@/lib/auth": { auth: async () => ({ user: { id: "1" } }) },
    "@/lib/db/index": { db },
    "@/lib/db/schema": schema,
    "@/lib/roles": { canImportStudents: () => true },
    "@/lib/student-number": { parseSchoolStudentNumber: (value: string) =>
      /^\d{5}$/.test(value) ? { grade: 1, classNumber: 1, seatNumber: 1 } : null },
    "@/lib/curriculum-access": { sessionTenant: () => ({ userId: 1, schoolId: 1, role: "teacher" }) },
    "drizzle-orm": { eq: () => null, inArray: () => null, or: () => null, and: () => null },
    bcryptjs: { hash: async () => "fictional-hash" },
  };
  vm.runInNewContext(javascript, { exports, File, console,
    require(name: string) {
      if (!(name in mocks)) throw Error(`Unexpected dependency: ${name}`);
      return mocks[name];
    },
  }, { filename: "app/api/admin/students/import/route.ts" });
  const csv = "학번,이름,초기비밀번호\n10501,가상 학생 하나,fictional1\n10502,가상 학생 둘,fictional2\n";
  const request = { formData: async () => ({ get: () => new File([csv], "students.csv") }) };
  type Result = { status: number; body: { created?: number } };
  return { route: exports as { POST: (input: unknown) => Promise<Result> }, request, inserted };
}

test("기존 학번이 섞인 CSV는 기존 PK를 수정하거나 일부 신규 계정을 만들지 않는다", async () => {
  const harness = routeHarness(true);
  const response = await harness.route.POST(harness.request);
  assert.equal(response.status, 409);
  assert.equal(harness.inserted.length, 0);
});

test("신규 CSV 두 행은 한 INSERT 호출로 처리한다", async () => {
  const harness = routeHarness();
  const response = await harness.route.POST(harness.request);
  assert.equal(response.status, 200);
  assert.equal(response.body.created, 2);
  assert.equal(harness.inserted.length, 1);
  assert.equal(harness.inserted[0].length, 2);
});
