import JSZip from 'jszip';

export type PortableNote = { id: string; title: string; content_markdown: string; folder_id: string | null };
export type PortableFolder = { id: string; name: string; parent_id: string | null };

export function safeFilename(value: string, fallback = 'untitled') {
  const cleaned = value.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-').replace(/\s+/g, ' ').replace(/\.+$/g, '');
  return (cleaned || fallback).slice(0, 180);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function noteMarkdown(note: PortableNote) {
  return note.content_markdown.endsWith('\n') ? note.content_markdown : `${note.content_markdown}\n`;
}

export function folderPath(folderId: string | null, folders: PortableFolder[]) {
  const names: string[] = [];
  let current = folderId;
  const seen = new Set<string>();
  while (current && !seen.has(current)) {
    seen.add(current);
    const folder = folders.find((item) => item.id === current);
    if (!folder) break;
    names.unshift(safeFilename(folder.name, 'Folder'));
    current = folder.parent_id;
  }
  return names;
}

export async function workspaceZip(notes: PortableNote[], folders: PortableFolder[]) {
  const zip = new JSZip();
  const used = new Set<string>();
  for (const note of notes) {
    const base = [...folderPath(note.folder_id, folders), safeFilename(note.title, 'Untitled note')].join('/');
    let path = `${base}.md`;
    let suffix = 2;
    while (used.has(path)) path = `${base} (${suffix++}).md`;
    used.add(path);
    zip.file(path, noteMarkdown(note));
  }
  return zip.generateAsync({ type: 'blob' });
}