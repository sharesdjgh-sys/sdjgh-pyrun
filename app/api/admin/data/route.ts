import { NextRequest, NextResponse } from "next/server";
import { writeFile, unlink } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "public", "data");

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "CSV 파일만 업로드할 수 있습니다." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const dest = path.join(DATA_DIR, file.name);
    await writeFile(dest, Buffer.from(bytes));
    return NextResponse.json({ ok: true, filename: file.name });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { filename } = await req.json();
    if (!filename || !filename.endsWith(".csv")) {
      return NextResponse.json({ error: "올바르지 않은 파일명입니다." }, { status: 400 });
    }
    const target = path.join(DATA_DIR, path.basename(filename));
    await unlink(target);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
