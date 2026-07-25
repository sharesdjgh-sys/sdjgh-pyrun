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
  let practiceConceptId: number | null = null;
  if (data.practiceConceptId !== undefined && data.practiceConceptId !== null) {
    if (typeof data.practiceConceptId !== "number" || !Number.isInteger(data.practiceConceptId) || data.practiceConceptId < 0) {
      throw new RequestValidationError("연습문제 정보가 올바르지 않습니다.");
    }
    practiceConceptId = data.practiceConceptId;
  }
  return {
    code: requiredString(data.code, "코드", 1, 20_000),
    stdout: typeof data.stdout === "string" ? data.stdout.slice(0, 8_000) : "",
    stderr: typeof data.stderr === "string" ? data.stderr.slice(0, 8_000) : "",
    isSuccess: data.isSuccess,
    practiceConceptId,
  };
}

export type StudentChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function validateStudentChat(input: unknown) {
  if (!input || typeof input !== "object") {
    throw new RequestValidationError("요청 형식이 올바르지 않습니다.");
  }
  const data = input as Record<string, unknown>;
  if (!Array.isArray(data.messages) || data.messages.length < 1 || data.messages.length > 10) {
    throw new RequestValidationError("대화는 1~10개 메시지만 보낼 수 있습니다.");
  }

  const messages = data.messages.map((item) => {
    if (!item || typeof item !== "object") {
      throw new RequestValidationError("대화 형식이 올바르지 않습니다.");
    }
    const message = item as Record<string, unknown>;
    if (message.role !== "user" && message.role !== "assistant") {
      throw new RequestValidationError("대화 역할이 올바르지 않습니다.");
    }
    return {
      role: message.role,
      content: requiredString(message.content, "메시지", 1, 1_000),
    } satisfies StudentChatMessage;
  });

  const context = data.context && typeof data.context === "object"
    ? data.context as Record<string, unknown>
    : {};
  const clipped = (value: unknown, max: number) =>
    typeof value === "string" ? value.trim().slice(0, max) : "";

  return {
    messages,
    context: {
      conceptName: clipped(context.conceptName, 100),
      conceptDescription: clipped(context.conceptDescription, 1_000),
      code: clipped(context.code, 8_000),
      output: clipped(context.output, 2_000),
      error: clipped(context.error, 2_000),
    },
  };
}

export function sanitizeStudentHintPart(value: unknown) {
  if (typeof value !== "string") return "";
  const withoutBlocks = value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]+`/g, "문법 형태");
  const codeLine = /^\s*(?:import\s|from\s|def\s|class\s|for\s|while\s|if\s|elif\s|else\s*:|try\s*:|except\b|with\s|return\b|print\s*\(|[A-Za-z_]\w*\s*=)/;
  return withoutBlocks
    .split(/\r?\n/)
    .filter((line) => !codeLine.test(line))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 700);
}
