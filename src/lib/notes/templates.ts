export type NoteTemplate = {
  id: string;
  name: string;
  description: string;
  title: string;
  content_markdown: string;
  agent_instructions: string;
};

export const BLANK_TEMPLATE_ID = 'blank';

const TODO_AGENT_INSTRUCTIONS = `A TO DO note with tabular nature
Columns : Task id (starts at 001), Task, Importance, Effort, Score, and Status
Scoring key: Importance → 🔴 High = 5, 🟠 Medium = 3, 🟢 Low = 1; Effort → 🔴 High = 1, 🟡 Medium = 3, 🟢 Low = 5;
Score = Importance + Effort
Completed tasks will be moved to the bottom of the table`;

const TODO_CONTENT = `# To-Do

| Task id | Task | Importance | Effort | Score | Status |
| ------- | ---- | ---------- | ------ | ----- | ------ |
| 001 | Example task — replace me | 🟠 Medium (3) | 🟡 Medium (3) | 6 | ⬜ Open |
| | | | | | |
`;

export const NOTE_TEMPLATES: NoteTemplate[] = [
  {
    id: 'todo',
    name: 'To-do note',
    description: 'Prioritized task table with Importance × Effort scoring.',
    title: 'To-Do',
    content_markdown: TODO_CONTENT,
    agent_instructions: TODO_AGENT_INSTRUCTIONS,
  },
];

export function findTemplate(id: string): NoteTemplate | undefined {
  return NOTE_TEMPLATES.find((template) => template.id === id);
}
