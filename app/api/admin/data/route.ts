import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { dataFiles } from "@/lib/db/schema";
import { canOpenAdminPage } from "@/lib/roles";
import { eq } from "drizzle-orm";

async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !canOpenAdminPage(role)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }
  return null;
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

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
      .values({ filename: file.name, content })
      .onConflictDoUpdate({ target: dataFiles.filename, set: { content, uploadedAt: new Date() } });

    return NextResponse.json({ ok: true, filename: file.name });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    const { filename } = await req.json();
    if (!filename || !filename.endsWith(".csv")) {
      return NextResponse.json({ error: "올바르지 않은 파일명입니다." }, { status: 400 });
    }
    await db.delete(dataFiles).where(eq(dataFiles.filename, filename));
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
