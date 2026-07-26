export type LearningAttemptStatus =
  | "solved"
  | "incorrect"
  | "free"
  | "runtime_error";

export interface LearningAttemptResult {
  isSuccess: boolean;
  practiceConceptId?: number | null;
  isSolved?: boolean | null;
}

export function learningAttemptStatus(attempt: LearningAttemptResult): LearningAttemptStatus {
  if (attempt.practiceConceptId !== null && attempt.practiceConceptId !== undefined) {
    if (attempt.isSolved === true) return "solved";
    return "incorrect";
  }
  return attempt.isSuccess ? "free" : "runtime_error";
}

export function learningReviewHref(conceptId: number): string {
  return Number.isInteger(conceptId) && conceptId >= 0
    ? `/learn?reviewConceptId=${conceptId}`
    : "/learn";
}
