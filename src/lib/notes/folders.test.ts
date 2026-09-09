import { describe, expect, it } from 'vitest';
import { collectFolderIds } from './folders';

describe('folder deletion targets', () => {
  it('includes nested folders so deleting a parent removes its child notes too', () => {
    const folders = [
      { id: 'root', parent_id: null },
      { id: 'parent', parent_id: 'root' },
      { id: 'child', parent_id: 'parent' },
      { id: 'other', parent_id: null },
    ];

    expect(collectFolderIds('root', folders)).toEqual(['root', 'parent', 'child']);
  });
});
