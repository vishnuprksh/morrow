'use client';

import { useEffect, useRef } from 'react';
import { Editor, editorViewCtx, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { setBlockType, toggleMark, wrapIn } from '@milkdown/prose/commands';
import type { Command } from '@milkdown/prose/state';
import { replaceAll } from '@milkdown/utils';

export type MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
};

type ToolbarAction = 'bold' | 'italic' | 'strike' | 'heading' | 'bulletList' | 'quote' | 'code' | 'link';

const toolbarActions: Array<{ action: ToolbarAction; label: string; content: React.ReactNode }> = [
  { action: 'bold', label: 'Bold', content: <strong>B</strong> },
  { action: 'italic', label: 'Italic', content: <em>I</em> },
  { action: 'strike', label: 'Strikethrough', content: <s>S</s> },
  { action: 'heading', label: 'Heading 1', content: 'H1' },
  { action: 'bulletList', label: 'Bulleted list', content: '☷' },
  { action: 'quote', label: 'Blockquote', content: '❝' },
  { action: 'code', label: 'Inline code', content: '</>' },
  { action: 'link', label: 'Link', content: '↗' },
];

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const currentValueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!rootRef.current) return;
    let disposed = false;
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, rootRef.current!);
        ctx.set(defaultValueCtx, currentValueRef.current);
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          currentValueRef.current = markdown;
          onChangeRef.current(markdown);
        });
      })
      .use(commonmark)
      .use(gfm)
      .use(listener);

    editorRef.current = editor;
    void editor.create().then(() => {
      if (disposed) void editor.destroy();
    });

    return () => {
      disposed = true;
      editorRef.current = null;
      void editor.destroy();
    };
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.action((ctx) => {
      if (value === currentValueRef.current) return;
      replaceAll(value)(ctx);
      currentValueRef.current = value;
    });
  }, [value]);

  function runToolbarAction(action: ToolbarAction) {
    const editor = editorRef.current;
    if (!editor) return;
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const { schema } = view.state;
      const selection = view.state.selection;
      const dispatch = (command: Command) => {
        command(view.state, view.dispatch);
        view.focus();
      };

      if (action === 'bold' && schema.marks.strong) dispatch(toggleMark(schema.marks.strong));
      if (action === 'italic' && schema.marks.emphasis) dispatch(toggleMark(schema.marks.emphasis));
      if (action === 'strike' && schema.marks.strikethrough) dispatch(toggleMark(schema.marks.strikethrough));
      if (action === 'heading' && schema.nodes.heading) dispatch(setBlockType(schema.nodes.heading, { level: 1 }));
      if (action === 'bulletList' && schema.nodes.bullet_list) dispatch(wrapIn(schema.nodes.bullet_list));
      if (action === 'quote' && schema.nodes.blockquote) dispatch(wrapIn(schema.nodes.blockquote));
      if (action === 'code' && schema.marks.inlineCode) dispatch(toggleMark(schema.marks.inlineCode));
      if (action === 'link') {
        if (selection.empty) return;
        const href = window.prompt('Link URL');
        if (href && schema.marks.link) dispatch(toggleMark(schema.marks.link, { href }));
      }
    });
  }

  return (
    <>
      <div className="formatting" role="toolbar" aria-label="Formatting toolbar">
        {toolbarActions.map(({ action, label, content }, index) => <span key={action} className={index === 3 ? 'toolbar-group' : undefined}><ToolbarButton label={label} onClick={() => runToolbarAction(action)}>{content}</ToolbarButton></span>)}
      </div>
      <div ref={rootRef} className="milkdown-editor" aria-label="Markdown note content" />
    </>
  );
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick}>{children}</button>;
}
