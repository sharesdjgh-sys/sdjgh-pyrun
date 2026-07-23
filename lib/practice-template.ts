const BLANK_PLACEHOLDER = "___";

export function createStudentPracticeTemplate(practiceCode: string): string {
  const normalized = practiceCode.replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  // LV3 exercises are intentionally built as runnable scaffolds with explicit blanks.
  if (normalized.includes(BLANK_PLACEHOLDER)) return normalized;

  const starterLines: string[] = [];
  let previousWasBlank = false;

  for (const sourceLine of normalized.split("\n")) {
    const line = sourceLine.trim();
    const keep = line.startsWith("#") || line.startsWith("import ") || line.startsWith("from ");
    if (!keep) continue;

    if (starterLines.length > 0 && !previousWasBlank) {
      starterLines.push("");
      previousWasBlank = true;
    }
    starterLines.push(line);
    previousWasBlank = false;
  }

  starterLines.push("", "# 위의 조건을 읽고 아래에 직접 코드를 작성하세요.");
  return starterLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
