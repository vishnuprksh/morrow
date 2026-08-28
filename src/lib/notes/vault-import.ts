export type VaultFile = {
  file: File;
  path: string;
  kind: 'note' | 'image';
  title?: string;
  folderPath?: string[];
};

export type VaultNote = VaultFile & { kind: 'note'; title: string; folderPath: string[] };
export type VaultImage = VaultFile & { kind: 'image' };

const imageExtensions = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

function extension(path: string) {
  return path.split('.').pop()?.toLowerCase() ?? '';
}

export function relativeVaultPath(file: File) {
  return (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
}

export function parseVaultFiles(files: FileList | File[]): { notes: VaultNote[]; images: VaultImage[]; ignored: string[] } {
  const notes: VaultNote[] = [];
  const images: VaultImage[] = [];
  const ignored: string[] = [];
  for (const file of Array.from(files)) {
    const path = relativeVaultPath(file);
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop() ?? file.name;
    const ext = extension(name);
    const folderPath = parts.slice(1);
    if (ext === 'md') notes.push({ file, path, kind: 'note', title: name.slice(0, -3) || 'Untitled note', folderPath });
    else if (imageExtensions.has(ext) || file.type.startsWith('image/')) images.push({ file, path, kind: 'image' });
    else ignored.push(path);
  }
  return { notes, images, ignored };
}

export function imageLookup(images: VaultImage[]) {
  return new Map(images.flatMap((image) => {
    const path = image.path.replaceAll('\\', '/');
    const basename = path.split('/').pop() ?? path;
    return [[path, image], [basename, image]] as const;
  }));
}

export function imageReferences(markdown: string) {
  const references = new Set<string>();
  const pattern = /!\[\[[^\]]+\]\]|!?(?:\[[^\]]*\])\(([^)]+)\)/g;
  for (const match of markdown.matchAll(pattern)) {
    const wiki = match[0].match(/^!\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/)?.[1];
    const markdownPath = match[1]?.split(/[?#]/)[0];
    const value = (wiki ?? markdownPath)?.trim();
    if (value) references.add(value.replace(/^\.\//, '').replaceAll('\\', '/'));
  }
  return [...references];
}

export function rewriteImageLinks(markdown: string, urlFor: (reference: string) => string | undefined) {
  return markdown
    .replace(/!\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (full, reference: string, alt?: string) => {
      const url = urlFor(reference.trim());
      return url ? `![${alt?.trim() || reference.trim()}](${url})` : full;
    })
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (full, alt: string, reference: string) => {
      const cleanReference = reference.split(/[?#]/)[0].trim();
      const url = urlFor(cleanReference);
      return url ? `![${alt}](${url})` : full;
    });
}
