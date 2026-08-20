import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { sessionTenant } from "@/lib/curriculum-access";
import { db } from "@/lib/db/index";
import { schools } from "@/lib/db/schema";
import { canManageSchoolBranding } from "@/lib/roles";

const MAX_LOGO_BYTES = 2 * 1024 * 1024;

async function getContext() {
  return sessionTenant(await auth());
}

function detectedImageType(bytes: Uint8Array): "image/png" | "image/jpeg" | "image/webp" | null {
  if (
    bytes.length >= 8
    && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
    && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) return "image/png";
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 12
    && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF"
    && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
  ) return "image/webp";
  return null;
}

export async function GET() {
  const context = await getContext();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const [school] = await db
    .select({ id: schools.id, name: schools.name, code: schools.code, logoUrl: schools.logoUrl, logoScale: schools.logoScale })
    .from(schools)
    .where(eq(schools.id, context.schoolId))
    .limit(1);

  if (!school) return NextResponse.json({ error: "학교 정보를 찾을 수 없습니다." }, { status: 404 });
  const logoUrl = school.logoUrl ?? (school.code === "서대전여고" ? "/sdj-logo.png" : null);
  return NextResponse.json(
    { school: { id: school.id, name: school.name, logoUrl, logoScale: school.logoScale } },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}

export async function PUT(req: NextRequest) {
  const context = await getContext();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canManageSchoolBranding(context.role)) {
    return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("logo");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "로고 이미지 파일을 선택해 주세요." }, { status: 400 });
  }
  if (file.size <= 0 || file.size > MAX_LOGO_BYTES) {
    return NextResponse.json({ error: "로고 이미지는 2MB 이하만 등록할 수 있습니다." }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const mimeType = detectedImageType(bytes);
  if (!mimeType) {
    return NextResponse.json({ error: "PNG, JPG 또는 WebP 이미지 파일만 등록할 수 있습니다." }, { status: 400 });
  }

  const logoUrl = `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
  const [school] = await db
    .update(schools)
    .set({ logoUrl })
    .where(eq(schools.id, context.schoolId))
    .returning({ id: schools.id, name: schools.name, logoUrl: schools.logoUrl, logoScale: schools.logoScale });

  if (!school) return NextResponse.json({ error: "학교 정보를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ school });
}

export async function PATCH(req: NextRequest) {
  const context = await getContext();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canManageSchoolBranding(context.role)) {
    return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const logoScale = Number(body?.logoScale);
  if (!Number.isInteger(logoScale) || logoScale < 70 || logoScale > 140 || logoScale % 10 !== 0) {
    return NextResponse.json({ error: "로고 크기는 70%부터 140%까지 10% 단위로 설정할 수 있습니다." }, { status: 400 });
  }

  const [school] = await db
    .update(schools)
    .set({ logoScale })
    .where(eq(schools.id, context.schoolId))
    .returning({ id: schools.id, name: schools.name, code: schools.code, logoUrl: schools.logoUrl, logoScale: schools.logoScale });
  if (!school) return NextResponse.json({ error: "학교 정보를 찾을 수 없습니다." }, { status: 404 });

  const logoUrl = school.logoUrl ?? (school.code === "서대전여고" ? "/sdj-logo.png" : null);
  return NextResponse.json({ school: { id: school.id, name: school.name, logoUrl, logoScale: school.logoScale } });
}

export async function DELETE() {
  const context = await getContext();
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canManageSchoolBranding(context.role)) {
    return NextResponse.json({ error: "교사 권한이 필요합니다." }, { status: 403 });
  }

  const [school] = await db
    .update(schools)
    // Empty string means intentionally hidden; null remains available for legacy defaults.
    .set({ logoUrl: "" })
    .where(eq(schools.id, context.schoolId))
    .returning({ id: schools.id, name: schools.name, logoUrl: schools.logoUrl, logoScale: schools.logoScale });

  if (!school) return NextResponse.json({ error: "학교 정보를 찾을 수 없습니다." }, { status: 404 });
  return NextResponse.json({ school });
}
