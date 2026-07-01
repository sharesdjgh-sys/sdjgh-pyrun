import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db/index";
import { dataFiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { filename } = await params;
  const rows = await db
    .select({ content: dataFiles.content })
    .from(dataFiles)
    .where(eq(dataFiles.filename, filename))
    .limit(1);

  if (!rows[0]) return new NextResponse("Not Found", { status: 404 });

  return new NextResponse(rows[0].content, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
