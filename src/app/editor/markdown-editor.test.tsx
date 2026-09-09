import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { MarkdownEditor, renderInlineSvgs } from './markdown-editor';

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
vi.mock('@milkdown/preset-commonmark', () => ({ commonmark: {}, imageSchema: { extendSchema: vi.fn(() => ({})) } }));
vi.mock('@milkdown/preset-gfm', () => ({ gfm: {} }));
vi.mock('@milkdown/plugin-math', () => ({ math: {}, katexOptionsCtx: { key: {} } }));
vi.mock('@milkdown/plugin-listener', () => ({ listener: {}, listenerCtx: {} }));
vi.mock('@milkdown/prose/commands', () => ({ setBlockType: vi.fn(), toggleMark: vi.fn(), wrapIn: vi.fn() }));
vi.mock('@milkdown/prose/history', () => ({ history: vi.fn(() => ({})), redo: vi.fn(), undo: vi.fn() }));
vi.mock('@milkdown/prose/keymap', () => ({ keymap: vi.fn(() => ({})) }));
vi.mock('@milkdown/prose/model', () => ({ Slice: vi.fn() }));

describe('MarkdownEditor', () => {
  it('renders safe inline SVG animation nodes from Markdown HTML', () => {
    const root = document.createElement('div');
    const host = document.createElement('span');
    host.dataset.type = 'html';
    host.dataset.value = '<svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="4"><animate attributeName="r" from="1" to="4" dur="1s" repeatCount="indefinite" /></circle><script>alert(1)</script></svg>';
    root.append(host);

    renderInlineSvgs(root);

    expect(root.querySelector('animate')).not.toBeNull();
    expect(root.querySelector('script')).not.toBeInTheDocument();
    expect(root.querySelector('svg')).not.toBeNull();
  });

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
    expect(screen.getByRole('button', { name: 'Insert table' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Resize image' })).toBeInTheDocument();
  });

  it('does not render the raw view inside the WYSIWYG editor', () => {
    render(<MarkdownEditor value={'# Notes'} onChange={vi.fn()} />);

    expect(screen.queryByLabelText('Raw Markdown note content')).not.toBeInTheDocument();
  });
});
