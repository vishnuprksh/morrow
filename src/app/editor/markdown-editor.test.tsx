import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MarkdownEditor } from './markdown-editor';

vi.mock('@milkdown/core', () => ({
  Editor: {
    make: vi.fn(() => ({
      config: () => {
        const chain = { use: () => chain, create: vi.fn().mockResolvedValue(undefined), destroy: vi.fn(), action: vi.fn() };
        return chain;
      },
    })),
  },
  editorViewCtx: {},
  rootCtx: {},
  defaultValueCtx: {},
}));
vi.mock('@milkdown/preset-commonmark', () => ({ commonmark: {} }));
vi.mock('@milkdown/preset-gfm', () => ({ gfm: {} }));
vi.mock('@milkdown/plugin-math', () => ({ math: {}, katexOptionsCtx: { key: {} } }));
vi.mock('@milkdown/plugin-listener', () => ({ listener: {}, listenerCtx: {} }));
vi.mock('@milkdown/prose/commands', () => ({ setBlockType: vi.fn(), toggleMark: vi.fn(), wrapIn: vi.fn() }));
vi.mock('@milkdown/utils', () => ({ replaceAll: vi.fn() }));

describe('MarkdownEditor', () => {
  it('configures KaTeX to keep invalid equations from crashing the editor', async () => {
    render(<MarkdownEditor value={'$\\[x$'} onChange={vi.fn()} />);

    expect((await import('@milkdown/core')).Editor.make).toHaveBeenCalled();
  });

  it('renders a labeled WYSIWYG editor and Markdown toolbar', () => {
    render(<MarkdownEditor value={'# Notes\n\n**Important**'} onChange={vi.fn()} />);

    expect(screen.getByRole('toolbar', { name: 'Formatting toolbar' })).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown note content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bulleted list' })).toBeInTheDocument();
  });
});
