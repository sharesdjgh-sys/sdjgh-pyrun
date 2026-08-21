import { NextRequest, NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, getCurriculumUnits, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { ensureDefaultMechdogUnits, getMechdogUnits } from "@/lib/mechdog-access";
import {
  badges,
  classCurriculumAssignments,
  concepts,
  curriculumSets,
  userConceptClears,
  userConceptPractices,
  userConceptUnlocks,
} from "@/lib/db/schema";

function parseId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = parseId((await params).curriculumId);
  if (!context || !curriculumId || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const [curriculum] = await db
    .select()
    .from(curriculumSets)
    .where(and(eq(curriculumSets.id, curriculumId), eq(curriculumSets.schoolId, context.schoolId)))
    .limit(1);
  await ensureDefaultMechdogUnits(curriculumId, context.userId);
  const [units, mechdogUnits] = await Promise.all([
    getCurriculumUnits(curriculumId),
    getMechdogUnits(curriculumId),
  ]);
  return NextResponse.json({ curriculum, units, mechdogUnits });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = parseId((await params).curriculumId);
  if (!context || !curriculumId || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
  const description = typeof body?.description === "string" ? body.description.trim().slice(0, 500) : "";
  if (!name) return NextResponse.json({ error: "커리큘럼 이름을 입력해주세요." }, { status: 400 });
  const [curriculum] = await db
    .update(curriculumSets)
    .set({ name, description: description || null, updatedAt: new Date() })
    .where(eq(curriculumSets.id, curriculumId))
    .returning();
  return NextResponse.json({ curriculum });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = parseId((await params).curriculumId);
  if (!context || !curriculumId || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const [curriculum] = await db
    .select({ isDefault: curriculumSets.isDefault })
    .from(curriculumSets)
    .where(eq(curriculumSets.id, curriculumId))
    .limit(1);
  if (curriculum?.isDefault) {
    return NextResponse.json({ error: "학교 기본 커리큘럼은 삭제할 수 없습니다." }, { status: 400 });
  }

  const [assignment] = await db
    .select({ id: classCurriculumAssignments.id })
    .from(classCurriculumAssignments)
    .where(eq(classCurriculumAssignments.curriculumId, curriculumId))
    .limit(1);
  if (assignment) {
    return NextResponse.json({ error: "학급에 배정된 커리큘럼은 삭제할 수 없습니다." }, { status: 409 });
  }

  const unitRows = await db
    .select({ id: concepts.id })
    .from(concepts)
    .where(eq(concepts.curriculumId, curriculumId));
  const unitIds = unitRows.map((item) => item.id);
  if (unitIds.length > 0) {
    const [clear, practice, unlock] = await Promise.all([
      db.select({ id: userConceptClears.id }).from(userConceptClears).where(inArray(userConceptClears.conceptId, unitIds)).limit(1),
      db.select({ id: userConceptPractices.id }).from(userConceptPractices).where(inArray(userConceptPractices.conceptId, unitIds)).limit(1),
      db.select({ id: userConceptUnlocks.id }).from(userConceptUnlocks).where(inArray(userConceptUnlocks.conceptId, unitIds)).limit(1),
    ]);
    if (clear.length || practice.length || unlock.length) {
      return NextResponse.json({ error: "학생 학습 기록이 있는 커리큘럼은 삭제할 수 없습니다." }, { status: 409 });
    }
    await db.delete(badges).where(inArray(badges.conceptId, unitIds));
    await db.delete(concepts).where(inArray(concepts.id, unitIds));
  }
  await db.delete(curriculumSets).where(eq(curriculumSets.id, curriculumId));
  return NextResponse.json({ ok: true });
}
