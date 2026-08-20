import { readFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const SAMPLE_FILENAME = "student-accounts-sample.csv";

export async function GET() {
  try {
    const samplePath = path.join(process.cwd(), "samples", SAMPLE_FILENAME);
    const bytes = await readFile(samplePath);
    const csv = new TextDecoder("utf-8", { fatal: true })
      .decode(bytes)
      .replace(/^\uFEFF/, "")
      .replace(/\r?\n/g, "\r\n");

    return new Response(`\uFEFF${csv}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${SAMPLE_FILENAME}"`,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Student account sample CSV error:", error);
    return Response.json({ error: "샘플 CSV 파일을 불러오지 못했습니다." }, { status: 500 });
  }
}
