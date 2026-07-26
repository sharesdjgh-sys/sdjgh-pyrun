const FIRST_BADGE_SOURCE_ID = 0;
const LAST_BADGE_SOURCE_ID = 40;

export function getBadgeImagePath(sourceConceptId: number | null | undefined) {
  if (
    typeof sourceConceptId !== "number" ||
    !Number.isInteger(sourceConceptId) ||
    sourceConceptId < FIRST_BADGE_SOURCE_ID ||
    sourceConceptId > LAST_BADGE_SOURCE_ID
  ) {
    return null;
  }

  return `/badges/concept-${sourceConceptId}.png`;
}
