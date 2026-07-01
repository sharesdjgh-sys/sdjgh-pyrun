import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const dir = path.join(process.cwd(), "public", "data");
    const entries = await readdir(dir);
    const files = entries.filter((f) => f.endsWith(".csv"));
    return NextResponse.json({ files });
  } catch {
    return NextResponse.json({ files: [] });
  }
}
