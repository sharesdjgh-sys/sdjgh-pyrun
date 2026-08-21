import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { mechdogUnits } from "@/lib/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const nameKo = typeof body?.nameKo === "string" ? body.nameKo.trim().slice(0, 50) : "";
  const requestedNameEn = typeof body?.nameEn === "string" ? body.nameEn.trim().slice(0, 50) : "";
  const groupName = typeof body?.groupName === "string" ? body.groupName.trim().slice(0, 80) : "기타";
  if (!nameKo) {
    return NextResponse.json({ error: "Mechdog 단원 이름을 입력해주세요." }, { status: 400 });
  }

  const [last] = await db
    .select({ orderIndex: mechdogUnits.orderIndex })
    .from(mechdogUnits)
    .where(eq(mechdogUnits.curriculumId, curriculumId))
    .orderBy(desc(mechdogUnits.orderIndex))
    .limit(1);
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const nameEn = requestedNameEn || `mechdog_${uniqueSuffix}`;
  const [unit] = await db
    .insert(mechdogUnits)
    .values({
      curriculumId,
      createdByUserId: context.userId,
      nameKo,
      nameEn,
      groupName: groupName || "기타",
      orderIndex: (last?.orderIndex ?? -1) + 1,
      description: typeof body?.description === "string" ? body.description.slice(0, 500) : null,
      exampleCode: typeof body?.exampleCode === "string" ? body.exampleCode.slice(0, 20000) : "",
    })
    .returning();
  return NextResponse.json({ unit }, { status: 201 });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const deletedUnits = await db
    .update(mechdogUnits)
    .set({ isActive: false })
    .where(and(
      eq(mechdogUnits.curriculumId, curriculumId),
      eq(mechdogUnits.isActive, true)
    ))
    .returning({ id: mechdogUnits.id });
  return NextResponse.json({ ok: true, deletedCount: deletedUnits.length });
}
