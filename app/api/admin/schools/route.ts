import { ensureDefaultMechdogUnits } from "@/lib/mechdog-access";
import { NextRequest, NextResponse } from "next/server";
import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { getCurriculumUnits, sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { badges, concepts, curriculumSets, schools, users } from "@/lib/db/schema";
import { isAdministratorRole } from "@/lib/roles";

async function requireAdministrator() {
  const context = sessionTenant(await auth());
  if (!context) {
    return { denied: NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 }) };
  }
  if (!isAdministratorRole(context.role)) {
    return { denied: NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 }) };
  }
  return context;
}

export async function GET() {
  const context = await requireAdministrator();
  if ("denied" in context) return context.denied;

  const rows = await db
    .select({
      id: schools.id,
      name: schools.name,
      loginName: schools.code,
      createdAt: schools.createdAt,
      userCount: sql<number>`count(distinct ${users.id})::int`,
      curriculumCount: sql<number>`count(distinct ${curriculumSets.id})::int`,
    })
    .from(schools)
    .leftJoin(users, eq(users.schoolId, schools.id))
    .leftJoin(curriculumSets, eq(curriculumSets.schoolId, schools.id))
    .groupBy(schools.id)
    .orderBy(asc(schools.id));

  return NextResponse.json({ schools: rows });
}

export async function POST(req: NextRequest) {
  const context = await requireAdministrator();
  if ("denied" in context) return context.denied;

  let createdSchoolId: number | null = null;
  const createdConceptIds: number[] = [];

  try {
    const body = await req.json().catch(() => null);
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    const loginName = typeof body?.loginName === "string" ? body.loginName.trim().toLowerCase() : "";

    if (name.length < 2) {
      return NextResponse.json({ error: "학교 정식 명칭을 2자 이상 입력해주세요." }, { status: 400 });
    }
    if (!/^[가-힣a-z0-9-]{2,40}$/.test(loginName)) {
      return NextResponse.json(
        { error: "로그인 학교명은 한글, 영문, 숫자, 하이픈으로 2~40자여야 합니다." },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.code, loginName))
      .limit(1);
    if (existing) {
      return NextResponse.json({ error: "이미 등록된 로그인 학교명입니다." }, { status: 409 });
    }

    const [template] = await db
      .select({ curriculumId: curriculumSets.id })
      .from(curriculumSets)
      .innerJoin(schools, eq(curriculumSets.schoolId, schools.id))
      .where(and(eq(schools.code, "서대전여고"), eq(curriculumSets.isDefault, true)))
      .limit(1);
    if (!template) {
      return NextResponse.json({ error: "기본 커리큘럼을 찾을 수 없습니다." }, { status: 500 });
    }

    const templateUnits = await getCurriculumUnits(template.curriculumId);
    if (templateUnits.length === 0) {
      return NextResponse.json({ error: "기본 커리큘럼 단원이 준비되지 않았습니다." }, { status: 500 });
    }

    const [school] = await db
      .insert(schools)
      .values({ name, code: loginName })
      .returning({ id: schools.id, name: schools.name, loginName: schools.code, logoScale: schools.logoScale });
    createdSchoolId = school.id;

    const [curriculum] = await db
      .insert(curriculumSets)
      .values({
        schoolId: school.id,
        name: "기본 Python 커리큘럼",
        description: "서비스 기본 제공 커리큘럼",
        isDefault: true,
      })
      .returning({ id: curriculumSets.id });

    await ensureDefaultMechdogUnits(curriculum.id, context.userId);

    for (const source of templateUnits) {
      const [unit] = await db
        .insert(concepts)
        .values({
          curriculumId: curriculum.id,
          sourceConceptId: source.sourceConceptId ?? source.id,
          createdByUserId: context.userId,
          nameKo: source.nameKo,
          nameEn: source.nameEn,
          groupName: source.groupName,
          orderIndex: source.orderIndex,
          description: source.description,
          level: source.level,
          exampleCode: source.exampleCode,
          practiceCode: source.practiceCode,
        })
        .returning({ id: concepts.id });
      createdConceptIds.push(unit.id);
      await db.insert(badges).values({
        conceptId: unit.id,
        nameKo: source.badgeNameKo ?? `${source.nameKo} 완료`,
        iconName: source.iconName ?? "Award",
        colorClass: source.colorClass ?? "text-purple-500",
      });
    }

    return NextResponse.json({
      school: { ...school, userCount: 0, curriculumCount: 1 },
    }, { status: 201 });
  } catch (error) {
    if (createdConceptIds.length > 0) {
      await db.delete(badges).where(inArray(badges.conceptId, createdConceptIds)).catch(() => undefined);
    }
    if (createdSchoolId) {
      await db.delete(schools).where(eq(schools.id, createdSchoolId)).catch(() => undefined);
    }
    console.error("Admin school creation error", error);
    return NextResponse.json({ error: "학교를 등록하지 못했습니다." }, { status: 500 });
  }
}
