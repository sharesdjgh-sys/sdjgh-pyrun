import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { concepts } from "@/lib/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const rows = await db.select().from(concepts).orderBy(asc(concepts.orderIndex));
  return NextResponse.json(rows);
}
