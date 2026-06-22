export function calculateProgress(clearedCount: number, totalConcepts: number) {
  if (!Number.isFinite(totalConcepts) || totalConcepts <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((clearedCount / totalConcepts) * 100)));
}

export function authenticatedUserId(session: { user?: { id?: string | null } } | null | undefined) {
  const id = Number(session?.user?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}
