import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { dataFiles } from "@/lib/db/schema";
import { canOpenAdminPage } from "@/lib/roles";
import { and, eq } from "drizzle-orm";
import { sessionTenant } from "@/lib/curriculum-access";

async function requireAdmin() {
  const context = sessionTenant(await auth());
  if (!context || !canOpenAdminPage(context.role)) {
    return { denied: NextResponse.json({ error: "권한이 없습니다." }, { status: 403 }) };
  }
  return { context };
}

export async function POST(req: NextRequest) {
  const authResult = await requireAdmin();
  if ("denied" in authResult) return authResult.denied;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "CSV 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    const content = await file.text();
    await db
      .insert(dataFiles)
      .values({
        schoolId: authResult.context.schoolId,
        uploadedByUserId: authResult.context.userId,
        filename: file.name,
        content,
      })
      .onConflictDoUpdate({
        target: [dataFiles.schoolId, dataFiles.filename],
        set: { content, uploadedByUserId: authResult.context.userId, uploadedAt: new Date() },
      });

    return NextResponse.json({ ok: true, filename: file.name });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authResult = await requireAdmin();
  if ("denied" in authResult) return authResult.denied;

  try {
    const { filename } = await req.json();
    if (!filename || !filename.endsWith(".csv")) {
      return NextResponse.json({ error: "올바르지 않은 파일명입니다." }, { status: 400 });
    }
    await db.delete(dataFiles).where(and(
      eq(dataFiles.schoolId, authResult.context.schoolId),
      eq(dataFiles.filename, filename)
    ));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
