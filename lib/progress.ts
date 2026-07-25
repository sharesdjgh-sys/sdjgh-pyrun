import { UNIT_GROUPS_LV1, UNIT_GROUPS_LV2, UNIT_GROUPS_LV3 } from "./curriculum";

// 로봇 소개는 필수 진도에서 제외하고 언제나 열어 둔다.
const INTRO_CONCEPT_ID = 0;

// 화면에 표시되는 레벨별 학습 순서. 레벨끼리는 독립이고, 앞 개념을 클리어해야 다음이 열린다.
export const LEVEL_CONCEPT_ORDERS: number[][] = [
  UNIT_GROUPS_LV1.flatMap((group) => group.ids).filter((id) => id !== INTRO_CONCEPT_ID),
  UNIT_GROUPS_LV2.flatMap((group) => group.ids),
  UNIT_GROUPS_LV3.flatMap((group) => group.ids),
];

export function effectiveConceptAccessIds(
  clearedIds: Iterable<number>,
  manuallyUnlockedIds: Iterable<number>
): Set<number> {
  return effectiveConceptAccessIdsForOrders(clearedIds, manuallyUnlockedIds, LEVEL_CONCEPT_ORDERS);
}

export function effectiveConceptAccessIdsForOrders(
  clearedIds: Iterable<number>,
  manuallyUnlockedIds: Iterable<number>,
  orders: number[][]
): Set<number> {
  const effective = new Set(clearedIds);

  for (const unlockedId of manuallyUnlockedIds) {
    if (unlockedId === INTRO_CONCEPT_ID) {
      effective.add(unlockedId);
      continue;
    }

    for (const order of orders) {
      const idx = order.indexOf(unlockedId);
      if (idx === -1) continue;
      order.slice(0, idx + 1).forEach((id) => effective.add(id));
      break;
    }
  }

  return effective;
}

export function isConceptUnlocked(conceptId: number, clearedIds: Iterable<number>): boolean {
  return isConceptUnlockedInOrders(conceptId, clearedIds, LEVEL_CONCEPT_ORDERS);
}

export function isConceptUnlockedInOrders(
  conceptId: number,
  clearedIds: Iterable<number>,
  orders: number[][]
): boolean {
  const cleared = new Set(clearedIds);
  if (cleared.has(conceptId)) return true;
  if (conceptId === INTRO_CONCEPT_ID) return true;
  for (const order of orders) {
    const idx = order.indexOf(conceptId);
    if (idx === -1) continue;
    return order.slice(0, idx).every((id) => cleared.has(id));
  }
  return false;
}

// 방금 클리어한 개념의 바로 다음 개념 ID (레벨 마지막이면 null)
export function nextConceptId(conceptId: number): number | null {
  return nextConceptIdInOrders(conceptId, LEVEL_CONCEPT_ORDERS);
}

export function nextConceptIdInOrders(conceptId: number, orders: number[][]): number | null {
  if (conceptId === INTRO_CONCEPT_ID) return orders[0]?.find((id) => id !== INTRO_CONCEPT_ID) ?? null;
  for (const order of orders) {
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
