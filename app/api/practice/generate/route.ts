import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  rateLimit,
  RequestValidationError,
  validateExtraPracticeRequest,
} from "@/lib/api-guard";
import {
  getCurriculumUnits,
  resolveCurriculumIdForUser,
  sessionTenant,
} from "@/lib/curriculum-access";
import { generateExtraPracticeProblem } from "@/lib/gemini";

function toStarterCode(problem: {
  title: string;
  description: string;
  requirements: string[];
}) {
  const lines = [
    `# AI 추가 문제: ${problem.title}`,
    "#",
    `# ${problem.description}`,
    "#",
    "# 조건",
    ...problem.requirements.map((requirement, index) => `# ${index + 1}. ${requirement}`),
    "",
    "# 아래에 직접 코드를 작성하세요.",
  ];
  return lines.join("\n");
}

export async function POST(req: NextRequest) {
  const context = sessionTenant(await auth());
  if (!context) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rate = rateLimit(req, `extra-practice:${context.userId}`, 6);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "문제를 너무 자주 만들고 있습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
    );
  }

  try {
    const { conceptId } = validateExtraPracticeRequest(await req.json());
    const curriculumId = await resolveCurriculumIdForUser(context);
    const units = curriculumId ? await getCurriculumUnits(curriculumId) : [];
    const unit = units.find((item) => item.id === conceptId);
    if (!unit) {
      return NextResponse.json({ error: "현재 커리큘럼의 단원을 찾을 수 없습니다." }, { status: 404 });
    }

    const problem = await generateExtraPracticeProblem({
      conceptName: unit.nameKo,
      conceptDescription: unit.description ?? "",
      referencePractice: unit.practiceCode ?? "",
    });

    return NextResponse.json({
      title: problem.title,
      starterCode: toStarterCode(problem),
    });
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Extra practice generation error:", error);
    return NextResponse.json(
      { error: "추가 문제를 만들지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}
