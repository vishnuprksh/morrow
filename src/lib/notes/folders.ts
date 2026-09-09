export type FolderLike = { id: string; parent_id: string | null };

export function collectFolderIds(folderId: string, folders: FolderLike[]): string[] {
  const ids = new Set<string>();
  const queue = [folderId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || ids.has(current)) continue;
    ids.add(current);
    for (const folder of folders) {
      if (folder.parent_id === current) queue.push(folder.id);
    }
  }

  return [...ids];
}
