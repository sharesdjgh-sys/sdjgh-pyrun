import { readFileSync } from "node:fs";
import { planPyRunProvisioning, publicPyRunProvisioningSummary } from
  "./plan-smart-campus-provisioning";

// 개인별 입력은 보호 경로에서만 읽고 공개 출력에는 집계만 기록한다.
const input = JSON.parse(readFileSync(process.argv[2], "utf8"));
const plan = planPyRunProvisioning(input.snapshot, input.schoolId,
  input.localUsers, input.decisions, input.bindings ?? []);
process.stdout.write(`${JSON.stringify(publicPyRunProvisioningSummary(plan))}\n`);
if (!plan.structurallyReady) process.exitCode = 1;
