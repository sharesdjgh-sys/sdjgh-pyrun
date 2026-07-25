import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";
import { db } from "@/lib/db/index";
import { curriculumSets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { CurriculumItem } from "@/lib/curriculum";
import { isStudentRole } from "@/lib/roles";
import { createStudentPracticeTemplate } from "@/lib/practice-template";
import { getCurriculumUnits, resolveCurriculumIdForUser, sessionTenant } from "@/lib/curriculum-access";
import type { CurriculumView } from "@/lib/curriculum-model";

export default async function LearnPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const context = sessionTenant(session);
  if (!context) redirect("/login");

  const curriculumId = await resolveCurriculumIdForUser(context);
  const rows = curriculumId ? await getCurriculumUnits(curriculumId) : [];
  const [curriculumSet] = curriculumId
    ? await db
        .select({ id: curriculumSets.id, name: curriculumSets.name })
        .from(curriculumSets)
        .where(eq(curriculumSets.id, curriculumId))
        .limit(1)
    : [];
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
  };

  return (
    <LearnClient
      userName={session.user?.name || "학생"}
      curriculum={curriculum}
      curriculumView={curriculumView}
      isStudent={isStudentRole(context.role)}
    />
  );
}
