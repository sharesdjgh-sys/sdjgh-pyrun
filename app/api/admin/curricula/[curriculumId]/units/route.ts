import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { badges, concepts } from "@/lib/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const nameKo = typeof body?.nameKo === "string" ? body.nameKo.trim().slice(0, 50) : "";
  const nameEn = typeof body?.nameEn === "string" ? body.nameEn.trim().slice(0, 50) : "";
  const groupName = typeof body?.groupName === "string" ? body.groupName.trim().slice(0, 80) : "기타";
  const level = Number(body?.level);
  if (!nameKo || !nameEn || !Number.isInteger(level) || level < 1 || level > 3) {
    return NextResponse.json({ error: "단원 이름과 레벨을 올바르게 입력해주세요." }, { status: 400 });
  }
  const [last] = await db
    .select({ orderIndex: concepts.orderIndex })
    .from(concepts)
    .where(and(eq(concepts.curriculumId, curriculumId), eq(concepts.level, level)))
    .orderBy(desc(concepts.orderIndex))
    .limit(1);
  const [unit] = await db
    .insert(concepts)
    .values({
      curriculumId,
      createdByUserId: context.userId,
      nameKo,
      nameEn,
      groupName: groupName || "기타",
      level,
      orderIndex: (last?.orderIndex ?? -1) + 1,
      description: typeof body?.description === "string" ? body.description.slice(0, 500) : null,
      exampleCode: typeof body?.exampleCode === "string" ? body.exampleCode.slice(0, 20000) : "",
      practiceCode: typeof body?.practiceCode === "string" ? body.practiceCode.slice(0, 20000) : "",
    })
    .returning();
  await db.insert(badges).values({
    conceptId: unit.id,
    nameKo: `${nameKo} 완료`,
    iconName: "Award",
    colorClass: "text-purple-500",
  });
  return NextResponse.json({ unit }, { status: 201 });
}
