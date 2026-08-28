import { describe, expect, it } from 'vitest';
import { imageReferences, parseVaultFiles, rewriteImageLinks } from './vault-import';

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
    expect(result.notes[0]).toMatchObject({ title: 'Plan', folderPath: ['Projects'] });
    expect(result.images).toHaveLength(1);
    expect(result.ignored).toEqual(['My Vault/data.pdf']);
  });

  it('finds wiki and markdown image references', () => {
    expect(imageReferences('![[images/photo.png]]\n![alt](images/other.jpg)')).toEqual(['images/photo.png', 'images/other.jpg']);
  });

  it('rewrites matching image references and leaves missing ones unchanged', () => {
    expect(rewriteImageLinks('![[images/photo.png]] ![alt](missing.jpg)', (ref) => ref === 'images/photo.png' ? '/api/image' : undefined)).toBe('![images/photo.png](/api/image) ![alt](missing.jpg)');
  });
});
