import type { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export class RequestValidationError extends Error {}

export function rateLimit(req: NextRequest, scope: string, limit: number, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip") || "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }
  bucket.count += 1;
  return { allowed: bucket.count <= limit, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
}

function requiredString(value: unknown, name: string, min: number, max: number) {
  if (typeof value !== "string") throw new RequestValidationError(`${name} 형식이 올바르지 않습니다.`);
  const normalized = value.trim();
  if (normalized.length < min || normalized.length > max) {
    throw new RequestValidationError(`${name}은(는) ${min}~${max}자여야 합니다.`);
  }
  return normalized;
}

export function validateRegistration(input: unknown) {
  if (!input || typeof input !== "object") throw new RequestValidationError("요청 형식이 올바르지 않습니다.");
  const data = input as Record<string, unknown>;
  const username = requiredString(data.username, "아이디", 4, 50);
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    throw new RequestValidationError("아이디는 영문, 숫자, 밑줄만 사용할 수 있습니다.");
  }
  return {
    username,
    password: requiredString(data.password, "비밀번호", 8, 128),
    displayName: data.displayName ? requiredString(data.displayName, "표시 이름", 1, 100) : username,
  };
}

export function validateFeedback(input: unknown) {
  if (!input || typeof input !== "object") throw new RequestValidationError("요청 형식이 올바르지 않습니다.");
  const data = input as Record<string, unknown>;
  if (typeof data.isSuccess !== "boolean") throw new RequestValidationError("실행 결과 형식이 올바르지 않습니다.");
  return {
    code: requiredString(data.code, "코드", 1, 20_000),
    stdout: typeof data.stdout === "string" ? data.stdout.slice(0, 8_000) : "",
    stderr: typeof data.stderr === "string" ? data.stderr.slice(0, 8_000) : "",
    isSuccess: data.isSuccess,
  };
}
