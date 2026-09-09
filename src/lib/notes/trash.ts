export const TRASH_RETENTION_DAYS = 30;

export function trashExpiryCutoff(now = new Date()): string {
  const cutoff = new Date(now);
  cutoff.setUTCDate(cutoff.getUTCDate() - TRASH_RETENTION_DAYS);
  return cutoff.toISOString();
}

export function isExpiredTrash(deletedAt: string, now = new Date()): boolean {
  return deletedAt <= trashExpiryCutoff(now);
}
