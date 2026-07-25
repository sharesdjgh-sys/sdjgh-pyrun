import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { badges, concepts, curriculumSets, schools, users } from "@/lib/db/schema";
import { getCurriculumUnits } from "@/lib/curriculum-access";
import { rateLimit, RequestValidationError, validateRegistration } from "@/lib/api-guard";

export async function POST(req: NextRequest) {
  let createdSchoolId: number | null = null;
  const createdConceptIds: number[] = [];

  try {
    const rate = rateLimit(req, "register-school", 3, 30 * 60_000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }
      );
    }

    const body = await req.json();
    const { username, password, displayName } = validateRegistration(body);
    const schoolName = typeof body.schoolName === "string" ? body.schoolName.trim().slice(0, 120) : "";
    const schoolCode = typeof body.schoolCode === "string" ? body.schoolCode.trim().toLowerCase() : "";

    if (schoolName.length < 2) {
      return NextResponse.json({ error: "학교 이름을 2자 이상 입력해주세요." }, { status: 400 });
    }
    if (!/^[a-z0-9-]{3,40}$/.test(schoolCode)) {
      return NextResponse.json(
        { error: "학교 코드는 영문 소문자, 숫자, 하이픈으로 3~40자여야 합니다." },
        { status: 400 }
      );
    }
    if (schoolCode === "default") {
      return NextResponse.json({ error: "사용할 수 없는 학교 코드입니다." }, { status: 400 });
    }

    const [existingSchool] = await db
      .select({ id: schools.id })
      .from(schools)
      .where(eq(schools.code, schoolCode))
      .limit(1);
    if (existingSchool) {
      return NextResponse.json({ error: "이미 사용 중인 학교 코드입니다." }, { status: 409 });
    }

    const [template] = await db
      .select({ curriculumId: curriculumSets.id })
      .from(curriculumSets)
      .innerJoin(schools, eq(curriculumSets.schoolId, schools.id))
      .where(and(eq(schools.code, "default"), eq(curriculumSets.isDefault, true)))
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
      .values({ name: schoolName, code: schoolCode })
      .returning({ id: schools.id, name: schools.name, code: schools.code });
    createdSchoolId = school.id;

    const passwordHash = await bcrypt.hash(password, 10);
    const [administrator] = await db
      .insert(users)
      .values({
        schoolId: school.id,
        username,
        passwordHash,
        displayName,
        role: "admin",
      })
      .returning({ id: users.id });

    const [curriculum] = await db
      .insert(curriculumSets)
      .values({
        schoolId: school.id,
        name: "기본 Python 커리큘럼",
        description: "서비스 기본 제공 커리큘럼",
        isDefault: true,
      })
      .returning({ id: curriculumSets.id });

    for (const source of templateUnits) {
      const [unit] = await db
        .insert(concepts)
        .values({
          curriculumId: curriculum.id,
          sourceConceptId: source.sourceConceptId ?? source.id,
          createdByUserId: administrator.id,
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

    return NextResponse.json({ success: true, school }, { status: 201 });
  } catch (error) {
    if (createdConceptIds.length > 0) {
      await db.delete(badges).where(inArray(badges.conceptId, createdConceptIds)).catch(() => undefined);
    }
    if (createdSchoolId) {
      await db.delete(schools).where(eq(schools.id, createdSchoolId)).catch(() => undefined);
    }
    if (error instanceof RequestValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("School registration error", error);
    return NextResponse.json({ error: "학교를 등록하지 못했습니다." }, { status: 500 });
  }
}
