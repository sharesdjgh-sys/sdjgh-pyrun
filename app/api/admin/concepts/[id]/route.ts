import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { concepts, curriculumSets } from "@/lib/db/schema";
import { sessionTenant } from "@/lib/curriculum-access";
import { isAdministratorRole } from "@/lib/roles";
import { and, eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const context = sessionTenant(await auth());
  if (!context || !isAdministratorRole(context.role)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const conceptId = Number(id);
  if (!Number.isInteger(conceptId) || conceptId < 0) {
    return NextResponse.json({ error: "잘못된 개념 ID입니다." }, { status: 400 });
  }

  const body = await req.json();
  const description = typeof body.description === "string" ? body.description.slice(0, 500) : undefined;
  const exampleCode = typeof body.exampleCode === "string" ? body.exampleCode.slice(0, 20000) : undefined;
  const practiceCode = typeof body.practiceCode === "string" ? body.practiceCode.slice(0, 20000) : undefined;

  const updateData: Record<string, string> = {};
  if (description !== undefined) updateData.description = description;
  if (exampleCode !== undefined) updateData.exampleCode = exampleCode;
  if (practiceCode !== undefined) updateData.practiceCode = practiceCode;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "변경할 내용이 없습니다." }, { status: 400 });
  }

  const [ownedConcept] = await db
    .select({ id: concepts.id })
    .from(concepts)
    .innerJoin(curriculumSets, eq(concepts.curriculumId, curriculumSets.id))
    .where(and(eq(concepts.id, conceptId), eq(curriculumSets.schoolId, context.schoolId)))
    .limit(1);
  if (!ownedConcept) {
    return NextResponse.json({ error: "단원을 찾을 수 없습니다." }, { status: 404 });
  }

  await db.update(concepts).set(updateData).where(eq(concepts.id, ownedConcept.id));
  return NextResponse.json({ ok: true });
}
