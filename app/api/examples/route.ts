import { NextRequest, NextResponse } from "next/server";
import { CONCEPT_EXAMPLES } from "@/lib/curriculum";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const conceptId = Number(searchParams.get("conceptId") || "1");

  const example = CONCEPT_EXAMPLES[conceptId];
  if (!example) {
    return NextResponse.json({ error: "개념을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ conceptId, ...example });
}
