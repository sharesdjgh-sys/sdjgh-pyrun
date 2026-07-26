const BLANK_PLACEHOLDER = "___";
const OUTPUT_DIVIDER = "#-----------------------------------------";
const EXPECTED_OUTPUT_HEADER = /^#\s*(?:\[(?:예상\s*)?출력\s*결과\]|(?:예상\s*)?출력\s*결과\s*:)/;

export function normalizePracticeOutputFrame(practiceCode: string): string {
  return practiceCode
    .replace(/^#{5,}\s*$/gm, OUTPUT_DIVIDER)
    .replace(/^#\s*(?:예상\s*)?출력\s*결과\s*:\s*$/gm, "# [출력 결과]");
}

export function extractExpectedOutput(practiceCode: string): string | null {
  const lines = practiceCode.replace(/\r\n/g, "\n").split("\n");
  const headerIndex = lines.findIndex((line) => EXPECTED_OUTPUT_HEADER.test(line.trim()));
  if (headerIndex < 0) return null;

  const outputLines: string[] = [];
  for (const sourceLine of lines.slice(headerIndex + 1)) {
    const trimmed = sourceLine.trim();
    if (!trimmed) {
      if (outputLines.length > 0) break;
      continue;
    }
    if (!trimmed.startsWith("#")) break;
    if (/^(?:#{5,}|#-{5,})$/.test(trimmed)) break;
    outputLines.push(trimmed.replace(/^#\s?/, ""));
  }

  return outputLines.length > 0 ? outputLines.join("\n") : null;
}

function normalizedOutput(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim().replace(/[ \t]+/g, " "))
    .filter(Boolean)
    .join("\n");
}

export function matchesExpectedOutput(expectedOutput: string, actualOutput: string): boolean {
  return normalizedOutput(actualOutput) === normalizedOutput(expectedOutput);
}

export function isExactExpectedOutput(expectedOutput: string): boolean {
  return !/\[(?:실행할 때마다|입력에 따라|데이터(?:와 라이브러리 버전)?에 따라)[^\]]*\]/.test(expectedOutput);
}

export function createExtraPracticeStarter(problem: {
  title: string;
  description: string;
  requirements: string[];
  expectedOutput: string[];
}): string {
  return [
    `# AI 추가 문제: ${problem.title}`,
    "#",
    `# ${problem.description}`,
    "#",
    "# 조건",
    ...problem.requirements.map((requirement, index) => `# ${index + 1}. ${requirement}`),
    OUTPUT_DIVIDER,
    "# [출력 결과]",
    ...problem.expectedOutput.map((line) => `# ${line}`),
    OUTPUT_DIVIDER,
    "",
    "# 아래에 직접 코드를 작성하세요.",
  ].join("\n");
}

export function createStudentPracticeTemplate(practiceCode: string): string {
  const normalized = normalizePracticeOutputFrame(practiceCode.replace(/\r\n/g, "\n")).trim();
  if (!normalized) return "";

  // LV3 exercises are intentionally built as runnable scaffolds with explicit blanks.
  if (normalized.includes(BLANK_PLACEHOLDER)) return normalized;

  const starterLines: string[] = [];
  let pendingBlank = false;

  for (const sourceLine of normalized.split("\n")) {
    const line = sourceLine.trim();
    const keep = line.startsWith("#") || line.startsWith("import ") || line.startsWith("from ");
    if (!keep) {
      if (starterLines.length > 0) pendingBlank = true;
      continue;
    }

    if (pendingBlank && starterLines.at(-1) !== "") {
      starterLines.push("");
    }
    starterLines.push(line);
    pendingBlank = false;
  }

  starterLines.push("", "# 위의 조건을 읽고 아래에 직접 코드를 작성하세요.");
  return starterLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
