import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { concepts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || (role !== "teacher" && role !== "admin")) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  const { id } = await params;
  const conceptId = Number(id);
  if (!Number.isInteger(conceptId) || conceptId < 0 || conceptId > 30) {
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

  await db.update(concepts).set(updateData).where(eq(concepts.id, conceptId));
  return NextResponse.json({ ok: true });
}
