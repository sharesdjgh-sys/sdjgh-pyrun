import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { badges, concepts } from "@/lib/db/schema";

async function authorizedIds(params: Promise<{ curriculumId: string; unitId: string }>) {
  const context = sessionTenant(await auth());
  const values = await params;
  const curriculumId = Number(values.curriculumId);
  const unitId = Number(values.unitId);
  if (!context || !Number.isInteger(curriculumId) || !Number.isInteger(unitId)) return null;
  if (!(await canManageCurriculum(context, curriculumId))) return null;
  return { context, curriculumId, unitId };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ curriculumId: string; unitId: string }> }) {
  const ids = await authorizedIds(params);
  if (!ids) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const nameKo = typeof body?.nameKo === "string" ? body.nameKo.trim().slice(0, 50) : "";
  const nameEn = typeof body?.nameEn === "string" ? body.nameEn.trim().slice(0, 50) : "";
  const groupName = typeof body?.groupName === "string" ? body.groupName.trim().slice(0, 80) : "기타";
  const level = Number(body?.level);
  const orderIndex = Number(body?.orderIndex);
  if (!nameKo || !nameEn || !Number.isInteger(level) || level < 1 || level > 3 || !Number.isInteger(orderIndex) || orderIndex < 0) {
    return NextResponse.json({ error: "단원 정보를 올바르게 입력해주세요." }, { status: 400 });
  }
  const [unit] = await db
    .update(concepts)
    .set({
      nameKo,
      nameEn,
      groupName: groupName || "기타",
      level,
      orderIndex,
      description: typeof body?.description === "string" ? body.description.slice(0, 500) : null,
      exampleCode: typeof body?.exampleCode === "string" ? body.exampleCode.slice(0, 20000) : "",
      practiceCode: typeof body?.practiceCode === "string" ? body.practiceCode.slice(0, 20000) : "",
    })
    .where(and(
      eq(concepts.id, ids.unitId),
      eq(concepts.curriculumId, ids.curriculumId),
      eq(concepts.isActive, true)
    ))
    .returning();
  if (!unit) return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  await db
    .update(badges)
    .set({ nameKo: `${nameKo} 완료` })
    .where(eq(badges.conceptId, ids.unitId));
  return NextResponse.json({ unit });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ curriculumId: string; unitId: string }> }) {
  const ids = await authorizedIds(params);
  if (!ids) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  const [unit] = await db
    .update(concepts)
    .set({ isActive: false })
    .where(and(eq(concepts.id, ids.unitId), eq(concepts.curriculumId, ids.curriculumId)))
    .returning({ id: concepts.id });
  if (!unit) return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
