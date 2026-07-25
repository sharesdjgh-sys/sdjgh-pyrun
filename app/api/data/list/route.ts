import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { dataFiles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { sessionTenant } from "@/lib/curriculum-access";

export async function GET() {
  const context = sessionTenant(await auth());
  if (!context) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try {
    const rows = await db
      .select({ filename: dataFiles.filename })
      .from(dataFiles)
      .where(eq(dataFiles.schoolId, context.schoolId))
      .orderBy(desc(dataFiles.uploadedAt));

    const files = rows.map((r) => ({
      filename: r.filename,
      url: `/api/data/${encodeURIComponent(r.filename)}`,
    }));
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
