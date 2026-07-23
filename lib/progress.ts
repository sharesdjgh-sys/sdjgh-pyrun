import { BADGE_METADATA, BADGE_METADATA_LV2, BADGE_METADATA_LV3 } from "./curriculum";

// 레벨별 학습 순서. 레벨끼리는 독립이고, 레벨 안에서는 앞 개념을 모두 클리어해야 다음이 열린다.
export const LEVEL_CONCEPT_ORDERS: number[][] = [
  BADGE_METADATA.map((b) => b.conceptId),
  BADGE_METADATA_LV2.map((b) => b.conceptId),
  BADGE_METADATA_LV3.map((b) => b.conceptId),
];

export function isConceptUnlocked(conceptId: number, clearedIds: Iterable<number>): boolean {
  const cleared = new Set(clearedIds);
  if (cleared.has(conceptId)) return true;
  for (const order of LEVEL_CONCEPT_ORDERS) {
    const idx = order.indexOf(conceptId);
    if (idx === -1) continue;
    return order.slice(0, idx).every((id) => cleared.has(id));
  }
  return false;
}

// 방금 클리어한 개념의 바로 다음 개념 ID (레벨 마지막이면 null)
export function nextConceptId(conceptId: number): number | null {
  for (const order of LEVEL_CONCEPT_ORDERS) {
    const idx = order.indexOf(conceptId);
    if (idx === -1) continue;
    return idx + 1 < order.length ? order[idx + 1] : null;
  }
  return null;
}

export function calculateProgress(clearedCount: number, totalConcepts: number) {
  if (!Number.isFinite(totalConcepts) || totalConcepts <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((clearedCount / totalConcepts) * 100)));
}

export function authenticatedUserId(session: { user?: { id?: string | null } } | null | undefined) {
  const id = Number(session?.user?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}
