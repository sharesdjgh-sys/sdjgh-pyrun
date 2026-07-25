import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { canManageCurriculum, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { classCurriculumAssignments, teacherClassAssignments } from "@/lib/db/schema";
import { isAdministratorRole } from "@/lib/roles";

export async function POST(req: NextRequest, { params }: { params: Promise<{ curriculumId: string }> }) {
  const context = sessionTenant(await auth());
  const curriculumId = Number((await params).curriculumId);
  if (!context || !Number.isInteger(curriculumId) || !(await canManageCurriculum(context, curriculumId))) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  const body = await req.json().catch(() => null);
  const grade = Number(body?.grade);
  const classNumber = Number(body?.classNumber);
  if (!Number.isInteger(grade) || grade < 1 || grade > 12 || !Number.isInteger(classNumber) || classNumber < 1 || classNumber > 99) {
    return NextResponse.json({ error: "학년과 반을 올바르게 입력해주세요." }, { status: 400 });
  }
  if (!isAdministratorRole(context.role)) {
    const [scope] = await db
      .select({ id: teacherClassAssignments.id })
      .from(teacherClassAssignments)
      .where(and(
        eq(teacherClassAssignments.teacherUserId, context.userId),
        eq(teacherClassAssignments.grade, grade),
        eq(teacherClassAssignments.classNumber, classNumber)
      ))
      .limit(1);
    if (!scope) return NextResponse.json({ error: "담당 학급에만 배정할 수 있습니다." }, { status: 403 });
  }
  const [assignment] = await db
    .insert(classCurriculumAssignments)
    .values({
      schoolId: context.schoolId,
      grade,
      classNumber,
      curriculumId,
      assignedByUserId: context.userId,
      assignedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [
        classCurriculumAssignments.schoolId,
        classCurriculumAssignments.grade,
        classCurriculumAssignments.classNumber,
      ],
      set: { curriculumId, assignedByUserId: context.userId, assignedAt: new Date() },
    })
    .returning();
  return NextResponse.json({ assignment });
}
