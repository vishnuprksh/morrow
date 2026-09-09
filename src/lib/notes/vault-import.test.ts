import { describe, expect, it } from 'vitest';
import { imageContentType, imageReferences, parseVaultFiles, rewriteImageLinks } from './vault-import';

function file(name: string, type = 'text/markdown') {
  const result = new File(['content'], name, { type }) as File & { webkitRelativePath: string };
  result.webkitRelativePath = `My Vault/${name}`;
  return result;
}

describe('vault import', () => {
  it('classifies markdown, images, and ignored files while preserving nested paths', () => {
    const nested = file('Projects/Plan.md');
    nested.webkitRelativePath = 'My Vault/Projects/Plan.md';
    const result = parseVaultFiles([nested, file('images/photo.png', 'image/png'), file('data.pdf', 'application/pdf')]);
    expect(result.vaultName).toBe('My Vault');
    expect(result.notes[0]).toMatchObject({ title: 'Plan', folderPath: ['Projects'] });
    expect(result.images).toHaveLength(1);
    expect(result.ignored).toEqual(['My Vault/data.pdf']);
  });

  it('infers storage-safe MIME types when directory files have no type', () => {
    expect(imageContentType(file('photo.jpg', ''))).toBe('image/jpeg');
    expect(imageContentType(file('diagram.svg', ''))).toBe('image/svg+xml');
  });

  it('finds wiki and markdown image references', () => {
    expect(imageReferences('![[images/photo.png]]\n![alt](images/other.jpg)')).toEqual(['images/photo.png', 'images/other.jpg']);
  });

  it('normalizes angle-bracketed and encoded markdown image paths before matching', () => {
    expect(imageReferences('![photo](<images/project-progress.png>)')).toEqual(['images/project-progress.png']);
    expect(imageReferences('![photo](images/project-progress%20copy.png)')).toEqual(['images/project-progress copy.png']);
  });

  it('rewrites matching image references and leaves missing ones unchanged', () => {
    expect(rewriteImageLinks('![[images/photo.png]] ![alt](missing.jpg)', (ref) => ref === 'images/photo.png' ? '/api/image' : undefined)).toBe('![images/photo.png](/api/image) ![alt](missing.jpg)');
    expect(rewriteImageLinks('![photo](<images/project-progress.png>)', (ref) => ref === 'images/project-progress.png' ? '/api/image' : undefined)).toBe('![photo](/api/image)');
  });
});
