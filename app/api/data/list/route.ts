import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { dataFiles } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db
      .select({ filename: dataFiles.filename })
      .from(dataFiles)
      .orderBy(desc(dataFiles.uploadedAt));

    const files = rows.map((r) => ({
      filename: r.filename,
      url: `/api/data/${r.filename}`,
    }));
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
