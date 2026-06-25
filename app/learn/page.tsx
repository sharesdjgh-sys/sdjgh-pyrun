import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import LearnClient from "./LearnClient";
import { db } from "@/lib/db/index";
import { concepts } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import type { CurriculumItem } from "@/lib/curriculum";

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
      practiceCode: row.practiceCode ?? "",
    };
  }

  return <LearnClient userName={session.user?.name || "학생"} curriculum={curriculum} />;
}
