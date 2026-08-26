export type NoteChangeProposal = {
  noteId: string;
  expectedVersion: number;
  original: string;
  replacement: string;
  explanation: string;
};

export type DiffSegment = { value: string; changed: boolean };

/** Returns whitespace-preserving, word-level segments for each side of a change. */
export function diffSegments(original: string, replacement: string): { original: DiffSegment[]; replacement: DiffSegment[] } {
  const left = original.match(/\s+|[^\s]+/g) ?? [];
  const right = replacement.match(/\s+|[^\s]+/g) ?? [];
  const table = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));
  for (let row = left.length - 1; row >= 0; row -= 1) {
    for (let column = right.length - 1; column >= 0; column -= 1) {
      table[row][column] = left[row] === right[column] ? table[row + 1][column + 1] + 1 : Math.max(table[row + 1][column], table[row][column + 1]);
    }
  }
  const originalSegments: DiffSegment[] = [];
  const replacementSegments: DiffSegment[] = [];
  let row = 0;
  let column = 0;
  while (row < left.length || column < right.length) {
    if (row < left.length && column < right.length && left[row] === right[column]) {
      originalSegments.push({ value: left[row], changed: false });
      replacementSegments.push({ value: right[column], changed: false });
      row += 1; column += 1;
    } else if (column < right.length && (row === left.length || table[row][column + 1] >= table[row + 1][column])) {
      replacementSegments.push({ value: right[column], changed: true });
      column += 1;
    } else {
      originalSegments.push({ value: left[row], changed: true });
      row += 1;
    }
  }
  return { original: originalSegments, replacement: replacementSegments };
}

export function changedLineCount(proposal: NoteChangeProposal) {
  const original = proposal.original.split('\n');
  const replacement = proposal.replacement.split('\n');
  return original.length + replacement.length;
}
