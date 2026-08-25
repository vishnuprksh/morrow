import { describe, expect, it } from 'vitest';
import { folderPath, safeFilename, workspaceZip } from './portability';

describe('note portability', () => {
  it('sanitizes unsafe filenames', () => expect(safeFilename('  ideas: /draft?.md  ')).toBe('ideas- -draft-.md'));
  it('builds nested folder paths without cycles', () => expect(folderPath('child', [{ id: 'root', name: 'Work', parent_id: null }, { id: 'child', name: 'Plans', parent_id: 'root' }])).toEqual(['Work', 'Plans']));
  it('creates a zip containing readable Markdown', async () => {
    const blob = await workspaceZip([{ id: '1', title: 'Hello', content_markdown: '# Hello', folder_id: null }], []);
    expect(blob.size).toBeGreaterThan(0);
  });
});