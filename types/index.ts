export interface User {
  id: number;
  username: string;
  role: "student" | "teacher";
  displayName: string | null;
  createdAt: Date;
}

export interface Concept {
  id: number;
  nameKo: string;
  nameEn: string;
  orderIndex: number;
  description: string | null;
}

export interface Badge {
  id: number;
  conceptId: number;
  nameKo: string;
  iconName: string;
  colorClass: string;
}

export interface UserConceptClear {
  id: number;
  userId: number;
  conceptId: number;
  clearedAt: Date;
}

export interface FeedbackHistoryItem {
  id: number;
  userId: number;
  conceptIds: number[];
  codeSubmitted: string;
  outputText: string | null;
  aiFeedback: string;
  isSuccess: boolean;
  createdAt: Date;
}

export interface DetectedConcept {
  conceptId: number;
  conceptKey: string;
  details: Record<string, unknown>;
}

export interface ParseResult {
  concepts: DetectedConcept[];
  primaryConcept: DetectedConcept | null;
  syntaxValid: boolean;
}

export type RobotEmotion = "happy" | "sad" | "angry" | "surprised" | "idle";

export type RobotState =
  | "idle"
  | "talking"
  | "walking"
  | "jumping"
  | "headShake"
  | "celebrating"
  | "error";

export interface RobotStateData {
  state: RobotState;
  steps?: number;
  speechText?: string;
  classCharacters?: ("warrior" | "archer")[];
  variableName?: string;
  variableValue?: string;
}

export interface FeedbackResponse {
  feedback: string;
  newlyEarnedBadgeIds: number[];
}

export interface ProgressData {
  clearedConceptIds: number[];
  feedbackHistory: FeedbackHistoryItem[];
  progressPercent: number;
}

export interface BadgeWithConcept extends Badge {
  concept: Concept;
  clearedAt?: Date;
  earned: boolean;
}
