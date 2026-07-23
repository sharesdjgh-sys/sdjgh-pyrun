import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";
import { db } from "@/lib/db/index";
import { concepts } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import type { CurriculumItem } from "@/lib/curriculum";
import { isStudentRole } from "@/lib/roles";
import { createStudentPracticeTemplate } from "@/lib/practice-template";

export default async function LearnPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const rows = await db.select().from(concepts).orderBy(asc(concepts.orderIndex));
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

  const role = (session.user as { role?: string } | undefined)?.role;

  return (
    <LearnClient
      userName={session.user?.name || "학생"}
      curriculum={curriculum}
      isStudent={isStudentRole(role)}
    />
  );
}
