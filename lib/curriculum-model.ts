export type LearningUnitMeta = {
  id: number;
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
