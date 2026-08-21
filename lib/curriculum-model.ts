export type LearningUnitMeta = {
  id: number;
  sourceConceptId: number | null;
  level: number;
  groupName: string;
  orderIndex: number;
  nameKo: string;
  badgeNameKo: string;
  iconName: string;
  colorClass: string;
};

export type CurriculumView = {
  id: number;
  name: string;
  units: LearningUnitMeta[];
  mechdogUnits: Array<{
    id: number;
    nameKo: string;
    nameEn: string;
    groupName: string;
    orderIndex: number;
    description: string;
    exampleCode: string;
  }>;
};

type OrderableLearningUnit = {
  id?: number;
  conceptId?: number;
  groupName?: string | null;
  orderIndex: number;
};

// 화면의 단원 순서와 잠금 해제 순서를 동일하게 유지한다.
// 그룹은 그 그룹에서 가장 이른 orderIndex 순서로, 그룹 안에서는 orderIndex 순서로 정렬한다.
export function curriculumDisplayOrder<T extends OrderableLearningUnit>(units: T[]): T[] {
  const groups = new Map<string, { firstOrder: number; items: T[] }>();

  for (const unit of units) {
    const groupKey = unit.groupName?.trim() || "__ungrouped";
    const group = groups.get(groupKey) ?? { firstOrder: unit.orderIndex, items: [] };
    group.firstOrder = Math.min(group.firstOrder, unit.orderIndex);
    group.items.push(unit);
    groups.set(groupKey, group);
  }

  return [...groups.values()]
    .sort((left, right) => left.firstOrder - right.firstOrder)
    .flatMap((group) =>
      group.items.sort((left, right) =>
        left.orderIndex - right.orderIndex ||
        (left.id ?? left.conceptId ?? 0) - (right.id ?? right.conceptId ?? 0)
      )
    );
}

export function curriculumLevelOrders(
  units: Array<{
    id: number;
    sourceConceptId?: number | null;
    level: number;
    groupName?: string | null;
    orderIndex: number;
  }>,
): number[][] {
  const levels = new Map<number, Array<{
    id: number;
    groupName?: string | null;
    orderIndex: number;
  }>>();

  for (const unit of units) {
    // 로봇 API 입문은 선택 활동이며 필수 단원의 순차 잠금을 막지 않는다.
    if (unit.sourceConceptId === 0) continue;

    const list = levels.get(unit.level) ?? [];
    list.push({ id: unit.id, groupName: unit.groupName, orderIndex: unit.orderIndex });
    levels.set(unit.level, list);
  }

  return [...levels.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, list]) => curriculumDisplayOrder(list).map((unit) => unit.id))
    .filter((order) => order.length > 0);
}

export function groupCurriculumUnits(units: LearningUnitMeta[], level: number) {
  const groups = new Map<string, LearningUnitMeta[]>();
  for (const unit of curriculumDisplayOrder(units.filter((item) => item.level === level))) {
    const list = groups.get(unit.groupName) ?? [];
    list.push(unit);
    groups.set(unit.groupName, list);
  }
  return [...groups.entries()].map(([label, items]) => ({
    label,
    ids: items.sort((a, b) => a.orderIndex - b.orderIndex).map((item) => item.id),
    icon: level === 3 ? "BarChart2" : level === 2 ? "Braces" : "Layers",
    color: level === 3 ? "#B86500" : level === 2 ? "#704FDF" : "#087F8C",
  }));
}

export function highestActiveCurriculumLevel(
  units: Array<{
    conceptId: number;
    sourceConceptId?: number | null;
    level: number;
    earned: boolean;
  }>,
  practicedConceptIds: Set<number>,
): number | null {
  const activeLevels = units
    .filter((unit) =>
      unit.sourceConceptId !== 0 &&
      (unit.earned || practicedConceptIds.has(unit.conceptId))
    )
    .map((unit) => unit.level);

  return activeLevels.length > 0 ? Math.max(...activeLevels) : null;
}
