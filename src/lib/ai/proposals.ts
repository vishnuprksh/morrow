export type NoteChangeProposal = {
  noteId: string;
  expectedVersion: number;
  original: string;
  replacement: string;
  explanation: string;
};

export function changedLineCount(proposal: NoteChangeProposal) {
  const original = proposal.original.split('\n');
  const replacement = proposal.replacement.split('\n');
  return original.length + replacement.length;
}
