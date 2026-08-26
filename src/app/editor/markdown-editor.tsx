'use client';

import { useEffect, useRef, useState } from 'react';
import { Editor, editorViewCtx, rootCtx, defaultValueCtx } from '@milkdown/core';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { setBlockType, toggleMark, wrapIn } from '@milkdown/prose/commands';
import type { Command } from '@milkdown/prose/state';
import { replaceAll } from '@milkdown/utils';
import { diffSegments, type DiffSegment, type NoteChangeProposal } from '@/lib/ai/proposals';

export type MarkdownEditorProps = {
  value: string;
  onChange: (markdown: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
  proposal?: NoteChangeProposal | null;
  onAcceptProposal?: (proposal: NoteChangeProposal) => void;
  onDiscardProposal?: () => void;
};

type EditAction = 'improve' | 'simplify' | 'shorten' | 'expand' | 'grammar' | 'custom';

const editActions: Array<{ action: EditAction; label: string }> = [
  { action: 'improve', label: 'Improve writing' },
  { action: 'simplify', label: 'Simplify' },
  { action: 'shorten', label: 'Shorten' },
  { action: 'expand', label: 'Expand' },
  { action: 'grammar', label: 'Fix grammar' },
];

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

export function MarkdownEditor({ value, onChange, onUploadImage, proposal: noteProposal, onAcceptProposal, onDiscardProposal }: MarkdownEditorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor | null>(null);
  const currentValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [selection, setSelection] = useState<{ from: number; to: number; text: string; top: number; left: number } | null>(null);
  const [proposal, setProposal] = useState<{ replacement: string; from: number; to: number; original: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customInstruction, setCustomInstruction] = useState('');
  const requestRef = useRef(0);
  const selectionRef = useRef(selection);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

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

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const updateSelection = () => {
      const editor = editorRef.current;
      if (!editor) return;
      editor.action((ctx) => {
        const view = ctx.get(editorViewCtx);
        const { from, to } = view.state.selection;
        if (from === to) return setSelection(null);
        const text = view.state.doc.textBetween(from, to, '\n');
        if (!text.trim()) return setSelection(null);
        const start = view.coordsAtPos(from);
        const end = view.coordsAtPos(to);
        const bounds = root.getBoundingClientRect();
        setSelection({ from, to, text, top: Math.max(4, end.bottom - bounds.top + 8), left: Math.max(4, start.left - bounds.left) });
      });
    };
    root.addEventListener('mouseup', updateSelection);
    root.addEventListener('keyup', updateSelection);
    return () => { root.removeEventListener('mouseup', updateSelection); root.removeEventListener('keyup', updateSelection); };
  }, []);

  async function requestEdit(action: EditAction, requestedInstruction = '') {
    if (!selectionRef.current || busy) return;
    let instruction = '';
    if (action === 'custom') {
      instruction = requestedInstruction.trim();
      if (!instruction) return;
    }
    const snapshot = selectionRef.current;
    const requestId = ++requestRef.current;
    setBusy(true);
    setProposal(null);
    try {
      const response = await fetch('/api/ai/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, selectedText: snapshot.text, contextBefore: value.slice(Math.max(0, value.indexOf(snapshot.text) - 2_000), value.indexOf(snapshot.text)), contextAfter: value.slice(value.indexOf(snapshot.text) + snapshot.text.length, value.indexOf(snapshot.text) + snapshot.text.length + 2_000), instruction }) });
      const body = await response.json() as { replacement?: string; error?: string };
      if (!response.ok || !body.replacement) throw new Error(body.error ?? 'Could not create an AI proposal.');
      if (requestId !== requestRef.current) return;
      setProposal({ replacement: body.replacement, from: snapshot.from, to: snapshot.to, original: snapshot.text });
    } catch (error) {
      if (requestId === requestRef.current) window.alert(error instanceof Error ? error.message : 'Could not create an AI proposal.');
    } finally {
      if (requestId === requestRef.current) setBusy(false);
    }
  }

  function submitCustomInstruction(event: React.FormEvent) {
    event.preventDefault();
    const instruction = customInstruction.trim();
    if (!instruction || busy) return;
    setCustomDialogOpen(false);
    setCustomInstruction('');
    void requestEdit('custom', instruction);
  }

  function applyProposal() {
    const current = proposal;
    const editor = editorRef.current;
    if (!current || !editor) return;
    let applied = false;
    editor.action((ctx) => {
      const view = ctx.get(editorViewCtx);
      const selectedText = view.state.doc.textBetween(current.from, current.to, '\n');
      if (selectedText !== current.original) return;
      view.dispatch(view.state.tr.insertText(current.replacement, current.from, current.to));
      view.focus();
      applied = true;
    });
    if (applied) {
      setProposal(null);
      setSelection(null);
    } else {
      setProposal(null);
      window.alert('The selection changed. The AI proposal was discarded.');
    }
  }

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
        {onUploadImage && <ToolbarButton label="Insert image" onClick={() => document.getElementById('attachment-picker')?.click()}>▧</ToolbarButton>}
      </div>
      {onUploadImage && <input id="attachment-picker" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml" hidden onChange={async (event) => { const file = event.target.files?.[0]; if (file) { const url = await onUploadImage(file); if (url) editorRef.current?.action((ctx) => { const view = ctx.get(editorViewCtx); view.dispatch(view.state.tr.insertText(`![${file.name}](${url})`)); view.focus(); }); } event.target.value = ''; }} />}
      <div className="editor-surface">
        <div ref={rootRef} className="milkdown-editor" aria-label="Markdown note content" />
        {noteProposal && <ProposalDiff key={`${noteProposal.noteId}-${noteProposal.expectedVersion}`} proposal={noteProposal} onAccept={onAcceptProposal} onDiscard={onDiscardProposal} />}
        {selection && !proposal && !noteProposal && <div className="ai-selection-menu" style={{ top: selection.top, left: selection.left }} role="menu" aria-label="AI edit actions"><strong>AI edit</strong>{editActions.map(({ action, label }) => <button key={action} type="button" disabled={busy} onMouseDown={(event) => event.preventDefault()} onClick={() => void requestEdit(action)}>{label}</button>)}<button type="button" disabled={busy} onMouseDown={(event) => event.preventDefault()} onClick={() => setCustomDialogOpen(true)}>Custom instruction</button>{busy && <span>Working…</span>}</div>}
        {proposal && <div className="ai-proposal" role="dialog" aria-label="AI edit proposal"><strong>Suggested replacement</strong><p>{proposal.replacement}</p><div><button type="button" onClick={applyProposal}>Accept</button><button type="button" onClick={() => setProposal(null)}>Discard</button></div></div>}
        {customDialogOpen && <div className="ai-custom-dialog" role="dialog" aria-modal="true" aria-labelledby="custom-instruction-title"><form onSubmit={submitCustomInstruction}><strong id="custom-instruction-title">Custom AI instruction</strong><label htmlFor="custom-instruction">Describe how to rewrite the selection</label><textarea id="custom-instruction" value={customInstruction} onChange={(event) => setCustomInstruction(event.target.value)} autoFocus maxLength={2_000} rows={4} /><div><button type="submit" disabled={!customInstruction.trim()}>Rewrite selection</button><button type="button" onClick={() => { setCustomDialogOpen(false); setCustomInstruction(''); }}>Cancel</button></div></form></div>}
      </div>
    </>
  );
}

function DiffText({ segments }: { segments: DiffSegment[] }) {
  return <pre>{segments.map((segment, index) => segment.changed ? <mark key={index}>{segment.value}</mark> : <span key={index}>{segment.value}</span>)}</pre>;
}

function ProposalDiff({ proposal, onAccept, onDiscard }: { proposal: NoteChangeProposal; onAccept?: (proposal: NoteChangeProposal) => void; onDiscard?: () => void }) {
  const [editedProposal, setEditedProposal] = useState(proposal.replacement);
  const proposedTextRef = useRef<HTMLDivElement>(null);
  const diff = diffSegments(proposal.original, proposal.replacement);
  return <div className="ai-note-proposal-backdrop"><div className="ai-note-proposal" role="dialog" aria-modal="true" aria-label="AI note change proposal"><div className="ai-note-proposal-header"><div><strong>Pending note update</strong><span>Review before applying</span></div><button type="button" className="ai-proposal-close" onClick={onDiscard} aria-label="Revert suggested changes">×</button></div><p>{proposal.explanation}</p><div className="diff-block"><div className="diff-pane diff-removed"><b>− Original</b><DiffText segments={diff.original} /></div><div className="diff-pane diff-added"><b>＋ Proposed · editable</b><div ref={proposedTextRef} className="diff-editor" contentEditable suppressContentEditableWarning role="textbox" aria-label="Edit proposed note changes" onInput={(event) => setEditedProposal(event.currentTarget.textContent ?? '')}>{diff.replacement.map((segment, index) => segment.changed ? <mark key={index}>{segment.value}</mark> : <span key={index}>{segment.value}</span>)}</div></div></div><div className="ai-proposal-actions"><button type="button" onClick={() => onAccept?.({ ...proposal, replacement: editedProposal })}>Apply changes</button><button type="button" onClick={() => { setEditedProposal(proposal.replacement); if (proposedTextRef.current) proposedTextRef.current.textContent = proposal.replacement; }}>Reset edit</button><button type="button" onClick={onDiscard}>Revert</button></div><span className="diff-legend"><i className="legend-removed" /> Removed <i className="legend-added" /> Added</span></div></div>;
}

function ToolbarButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return <button type="button" aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick}>{children}</button>;
}
