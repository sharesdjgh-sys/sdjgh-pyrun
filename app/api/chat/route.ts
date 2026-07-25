import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateLimit, RequestValidationError, validateStudentChat } from "@/lib/api-guard";
import { sessionTenant } from "@/lib/curriculum-access";
import { generateStudentHintChat } from "@/lib/gemini";
import { getStudentVocative } from "@/lib/student-name";

export async function POST(req: NextRequest) {
  const session = await auth();
  const context = sessionTenant(session);
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rate = rateLimit(req, `student-chat:${context.userId}`, 12);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "질문이 너무 빠릅니다. 잠시 생각해 본 뒤 다시 질문해주세요." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  try {
    const input = validateStudentChat(await req.json());
    const answer = await generateStudentHintChat({
      ...input,
      studentName: getStudentVocative(session?.user?.name),
    });
    return NextResponse.json({ answer });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Student chat API error:", error);
    return NextResponse.json({ error: "힌트를 준비하지 못했습니다." }, { status: 500 });
  }
}
