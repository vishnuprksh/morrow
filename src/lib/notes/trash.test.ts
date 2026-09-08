import { describe, expect, it } from 'vitest';
import { isExpiredTrash, trashExpiryCutoff } from './trash';

describe('trash retention', () => {
  it('calculates a 30-day UTC cutoff', () => {
    expect(trashExpiryCutoff(new Date('2026-09-08T12:00:00.000Z'))).toBe('2026-08-09T12:00:00.000Z');
  });

  it('expires notes at or before the cutoff', () => {
    const now = new Date('2026-09-08T12:00:00.000Z');
    const cutoff = trashExpiryCutoff(now);
    expect(isExpiredTrash(cutoff, now)).toBe(true);
    expect(isExpiredTrash('2026-08-09T12:00:00.001Z', now)).toBe(false);
  });
});
