import { curriculumDisplayOrder, type LearningUnitMeta } from "./curriculum-model";

export type LevelBadgeRank = {
  level: number;
  badge: LearningUnitMeta | null;
};

export function highestEarnedBadgesByLevel(
  units: LearningUnitMeta[],
  earnedConceptIds: ReadonlySet<number>,
  levels: number[] = [1, 2, 3]
): LevelBadgeRank[] {
  return levels.map((level) => {
    const earnedInLevel = curriculumDisplayOrder(
      units.filter((unit) =>
        unit.level === level &&
        unit.sourceConceptId !== 0 &&
        earnedConceptIds.has(unit.id)
      )
    );
    return { level, badge: earnedInLevel.at(-1) ?? null };
  });
}
