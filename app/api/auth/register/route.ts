import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/index";
import { schools, users } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { rateLimit, RequestValidationError, validateRegistration } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  try {
    const rate = rateLimit(req, "register", 5, 10 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json({ error: "요청이 너무 많습니다." }, {
        status: 429,
        headers: { "Retry-After": String(rate.retryAfter) },
      });
    }
    const body = await req.json();
    const { username, password, displayName } = validateRegistration(body);
    const schoolCode = typeof body.schoolCode === "string" && body.schoolCode.trim()
      ? body.schoolCode.trim().toLowerCase()
      : "default";

    const [school] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.code, schoolCode))
      .limit(1);
    if (!school) {
      return NextResponse.json({ error: "등록되지 않은 학교 코드입니다." }, { status: 400 });
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.schoolId, school.id), eq(users.username, username)))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "이미 사용 중인 아이디입니다." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      schoolId: school.id,
      username,
      passwordHash,
      displayName: displayName || username,
      role: "student",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
