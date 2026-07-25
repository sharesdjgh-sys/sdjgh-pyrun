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
};

export function curriculumLevelOrders(
  units: Array<{
    id: number;
    sourceConceptId?: number | null;
    level: number;
    orderIndex: number;
  }>,
): number[][] {
  const levels = new Map<number, Array<{ id: number; orderIndex: number }>>();

  for (const unit of units) {
    // 로봇 API 입문은 선택 활동이며 필수 단원의 순차 잠금을 막지 않는다.
    if (unit.sourceConceptId === 0) continue;

    const list = levels.get(unit.level) ?? [];
    list.push({ id: unit.id, orderIndex: unit.orderIndex });
    levels.set(unit.level, list);
  }

  return [...levels.entries()]
    .sort(([left], [right]) => left - right)
    .map(([, list]) =>
      list
        .sort(
          (left, right) =>
            left.orderIndex - right.orderIndex || left.id - right.id,
        )
        .map((unit) => unit.id),
    )
    .filter((order) => order.length > 0);
}

export function groupCurriculumUnits(units: LearningUnitMeta[], level: number) {
  const groups = new Map<string, LearningUnitMeta[]>();
  for (const unit of units.filter((item) => item.level === level)) {
    const list = groups.get(unit.groupName) ?? [];
    list.push(unit);
    groups.set(unit.groupName, list);
  }
  return [...groups.entries()].map(([label, items]) => ({
    label,
    ids: items.sort((a, b) => a.orderIndex - b.orderIndex).map((item) => item.id),
    icon: level === 3 ? "BarChart2" : level === 2 ? "Braces" : "Layers",
    color: level === 3 ? "#18C99A" : level === 2 ? "#7B5CF0" : "#7B5CF0",
  }));
}
