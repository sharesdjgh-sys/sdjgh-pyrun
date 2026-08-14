import type { RobotState } from "@/types";

export type StageDirection = "left" | "right" | "up" | "down";

export interface StagePoint {
  x: number;
  y: number;
}

const CLONE_OFFSETS: StagePoint[] = [
  { x: -65, y: 0 },
  { x: 65, y: 0 },
  { x: -105, y: 45 },
  { x: 105, y: 45 },
  { x: -105, y: -45 },
  { x: 105, y: -45 },
];

const MIN_CLONE_CLEARANCE_SQUARED = 45 ** 2;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const distanceSquared = (a: StagePoint, b: StagePoint) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

export function placeRobotClone(origin: StagePoint, existing: readonly StagePoint[]): StagePoint {
  const candidates = CLONE_OFFSETS.map((offset) => ({
    x: clamp(origin.x + offset.x, -150, 150),
    y: clamp(origin.y + offset.y, -95, 95),
  })).filter((candidate, index, all) =>
    all.findIndex((item) => item.x === candidate.x && item.y === candidate.y) === index
  );
  const occupied = [origin, ...existing];
  const preferredCandidate = candidates.find((candidate) =>
    occupied.every((point) => distanceSquared(candidate, point) >= MIN_CLONE_CLEARANCE_SQUARED)
  );

  if (preferredCandidate) return preferredCandidate;

  return candidates.reduce((best, candidate) => {
    const candidateClearance = Math.min(...occupied.map((point) => distanceSquared(candidate, point)));
    const bestClearance = Math.min(...occupied.map((point) => distanceSquared(best, point)));
    return candidateClearance > bestClearance ? candidate : best;
  }, candidates[0]);
}

export function characterFacing(direction: StageDirection): "left" | "right" {
  return direction === "left" ? "left" : "right";
}

export function cloneAnimationState(robotState: RobotState): RobotState {
  return robotState === "celebrating" ? "celebrating" : "idle";
}
