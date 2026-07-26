export type LearningAttemptStatus =
  | "solved"
  | "incorrect"
  | "pending"
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
    if (attempt.isSolved === false) return "incorrect";
    return "pending";
  }
  return attempt.isSuccess ? "free" : "runtime_error";
}
