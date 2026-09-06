import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { curriculumSets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CurriculumItem } from "@/lib/curriculum";
import { createStudentPracticeTemplate } from "@/lib/practice-template";
import { getCurriculumUnits, resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";
import type { CurriculumView } from "@/lib/curriculum-model";
import { getMechdogUnits } from "@/lib/mechdog-access";


export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const curriculumId = await resolveCurriculumIdForUser(context);
    const [rows, mechdogRows, sets] = curriculumId
      ? await Promise.all([
          getCurriculumUnits(curriculumId),
          getMechdogUnits(curriculumId),
          db.select({ id: curriculumSets.id, name: curriculumSets.name })
            .from(curriculumSets).where(eq(curriculumSets.id, curriculumId)).limit(1),
        ])
      : [[], [], []];
    const curriculumSet = sets[0];
    const curriculum: Record<number, CurriculumItem> = {};
    for (const row of rows) {
      curriculum[row.id] = {
        nameKo: row.nameKo,
        nameEn: row.nameEn,
        explanation: row.description ?? "",
        exampleCode: row.exampleCode ?? "",
        // 완성된 풀이 코드는 브라우저에 전달하지 않고 주석 중심의 시작 템플릿만 제공한다.
        practiceCode: createStudentPracticeTemplate(row.practiceCode ?? ""),
      };
    }
    const curriculumView: CurriculumView = {
      id: curriculumSet?.id ?? 0,
      name: curriculumSet?.name ?? "배정된 커리큘럼 없음",
      units: rows.map((row) => ({
        id: row.id,
        sourceConceptId: row.sourceConceptId,
        level: row.level,
        groupName: row.groupName,
        orderIndex: row.orderIndex,
        nameKo: row.nameKo,
        badgeNameKo: row.badgeNameKo ?? `${row.nameKo} 완료`,
        iconName: row.iconName ?? "Award",
        colorClass: row.colorClass ?? "text-purple-500",
      })),
      mechdogUnits: mechdogRows.map((row) => ({
        id: row.id,
        nameKo: row.nameKo,
        nameEn: row.nameEn,
        groupName: row.groupName,
        orderIndex: row.orderIndex,
        description: row.description ?? "",
        exampleCode: row.exampleCode ?? "",
      })),
    };

    return NextResponse.json({ curriculum, curriculumView }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("Learning bootstrap failed", error);
    return NextResponse.json({ error: "학습 자료를 불러오지 못했습니다." }, { status: 500 });
  }
}
