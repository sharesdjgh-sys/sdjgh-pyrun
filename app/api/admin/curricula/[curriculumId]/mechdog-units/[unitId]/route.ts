import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { mechdogUnits } from "@/lib/db/schema";

async function authorizedIds(params: Promise<{ curriculumId: string; unitId: string }>) {
  const context = sessionTenant(await auth());
  const values = await params;
  const curriculumId = Number(values.curriculumId);
  const unitId = Number(values.unitId);
  if (!context || !Number.isInteger(curriculumId) || !Number.isInteger(unitId)) return null;
  if (!(await canManageCurriculum(context, curriculumId))) return null;
  return { curriculumId, unitId };
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ curriculumId: string; unitId: string }> }) {
  const ids = await authorizedIds(params);
  if (!ids) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  const body = await req.json().catch(() => null);
  const nameKo = typeof body?.nameKo === "string" ? body.nameKo.trim().slice(0, 50) : "";
  const nameEn = typeof body?.nameEn === "string" ? body.nameEn.trim().slice(0, 50) : "";
  const groupName = typeof body?.groupName === "string" ? body.groupName.trim().slice(0, 80) : "기타";
  const orderIndex = Number(body?.orderIndex);
  if (!nameKo || !nameEn || !Number.isInteger(orderIndex) || orderIndex < 0) {
    return NextResponse.json({ error: "Mechdog 단원 정보를 올바르게 입력해주세요." }, { status: 400 });
  }
  const [unit] = await db
    .update(mechdogUnits)
    .set({
      nameKo,
      nameEn,
      groupName: groupName || "기타",
      orderIndex,
      description: typeof body?.description === "string" ? body.description.slice(0, 500) : null,
      exampleCode: typeof body?.exampleCode === "string" ? body.exampleCode.slice(0, 20000) : "",
    })
    .where(and(
      eq(mechdogUnits.id, ids.unitId),
      eq(mechdogUnits.curriculumId, ids.curriculumId),
      eq(mechdogUnits.isActive, true)
    ))
    .returning();
  if (!unit) return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ unit });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ curriculumId: string; unitId: string }> }) {
  const ids = await authorizedIds(params);
  if (!ids) return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  const [unit] = await db
    .update(mechdogUnits)
    .set({ isActive: false })
    .where(and(eq(mechdogUnits.id, ids.unitId), eq(mechdogUnits.curriculumId, ids.curriculumId)))
    .returning({ id: mechdogUnits.id });
  if (!unit) return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
