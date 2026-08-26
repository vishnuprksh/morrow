import { describe, expect, it } from 'vitest';
import { diffSegments } from './proposals';

describe('diffSegments', () => {
  it('marks only changed words and preserves unchanged whitespace', () => {
    const diff = diffSegments('Keep this note.', 'Keep that note.');

    expect(diff.original).toEqual([
      { value: 'Keep', changed: false },
      { value: ' ', changed: false },
      { value: 'this', changed: true },
      { value: ' ', changed: false },
      { value: 'note.', changed: false },
    ]);
    expect(diff.replacement).toEqual([
      { value: 'Keep', changed: false },
      { value: ' ', changed: false },
      { value: 'that', changed: true },
      { value: ' ', changed: false },
      { value: 'note.', changed: false },
    ]);
  });

  it('marks inserted and deleted content independently', () => {
    const diff = diffSegments('A short note', 'A very short note');

    expect(diff.original.some((segment) => segment.changed && segment.value === 'short')).toBe(false);
    expect(diff.replacement).toContainEqual({ value: 'very', changed: true });
  });
});
