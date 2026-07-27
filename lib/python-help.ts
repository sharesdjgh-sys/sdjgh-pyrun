const HELP_CALL_PATTERN = /\bhelp\s*\(\s*([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)*)?\s*\)/i;

/**
 * Returns the object named in a Python help(...) question.
 * The deliberately narrow expression keeps arbitrary student code out of prompts.
 */
export function getPythonHelpTarget(message: string): string | null {
  const match = message.match(HELP_CALL_PATTERN);
  if (!match) return null;
  return match[1] || "help";
}

export function sanitizePythonHelpPart(value: unknown, maxLength = 1_200) {
  if (typeof value !== "string") return "";
  return value
    .replace(/```(?:python)?/gi, "")
    .replace(/```/g, "")
    .replace(/\u0000/g, "")
    .trim()
    .slice(0, maxLength);
}
