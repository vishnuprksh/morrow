'use client';

import { useEffect, useRef, useState } from 'react';
import { Eraser, Send, Square, X } from 'lucide-react';
import type { NoteChangeProposal } from '@/lib/ai/proposals';

type NoteContext = { id: string; title: string; content_markdown: string; folder_id: string | null; version: number };
type ChatMessage = { role: 'user' | 'assistant'; content: string };
const STATUS_PREFIX = '__MORROW_STATUS__';

export function extractNoteChangeProposal(text: string): NoteChangeProposal | null {
  const start = text.search(/\{\s*"type"\s*:\s*"note_change_proposal"/);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const character = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === '{') depth += 1;
    else if (character === '}' && --depth === 0) {
      try {
        const proposal = JSON.parse(text.slice(start, index + 1)) as Partial<NoteChangeProposal>;
        if (typeof proposal.noteId === 'string' && typeof proposal.expectedVersion === 'number' && typeof proposal.original === 'string' && typeof proposal.replacement === 'string' && typeof proposal.explanation === 'string') return proposal as NoteChangeProposal;
      } catch {
        return null;
      }
      return null;
    }
  }
  return null;
}

function visibleAssistantText(text: string) {
  const withoutStatus = text.replace(new RegExp(`\\n?${STATUS_PREFIX}\\{[^\\n]*\\}\\n?`, 'g'), '');
  const visibleProposalStart = withoutStatus.search(/\{\s*"type"\s*:\s*"note_change_proposal"/);
  return visibleProposalStart === -1 ? withoutStatus : withoutStatus.slice(0, visibleProposalStart).trimEnd();
}

function latestAgentStatus(text: string) {
  const statuses = [...text.matchAll(new RegExp(`${STATUS_PREFIX}(\\{[^\\n]*\\})`, 'g'))];
  const latest = statuses.at(-1)?.[1];
  if (!latest) return null;
  try {
    const status = JSON.parse(latest) as { type?: string; message?: string };
    return status.type === 'agent_status' && status.message ? status.message : null;
  } catch {
    return null;
  }
}

function WorkingIndicator({ message = 'Agent is working' }: { message?: string }) {
  return <div className="agent-working" role="status" aria-live="polite"><span>{message}</span><span className="typing-indicator" aria-hidden="true"><i /><i /><i /></span></div>;
}

export function AgentPanel({ activeNote, onClose, onProposal }: { activeNote: NoteContext | null; onClose: () => void; onProposal: (proposal: NoteChangeProposal) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }, [input]);

  async function send(message = input) {
    const text = message.trim();
    if (!text || busy) return;
    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput(''); setBusy(true); setActivity('Connecting to your agent...');
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch('/api/ai/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages, activeNote: activeNote && { id: activeNote.id, title: activeNote.title, content: activeNote.content_markdown, version: activeNote.version }, selection: { text: '' }, cursor: {} }), signal: controller.signal });
      if (!response.ok || !response.body) { const body = await response.json().catch(() => null) as { error?: string } | null; throw new Error(body?.error ?? 'The agent could not respond.'); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let answer = '';
      setMessages((current) => [...current, { role: 'assistant', content: '' }]);
      while (true) { const chunk = await reader.read(); if (chunk.done) break; answer += decoder.decode(chunk.value, { stream: true }); const status = latestAgentStatus(answer); if (status) setActivity(status); setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: visibleAssistantText(answer) } : item)); }
      const proposal = extractNoteChangeProposal(answer);
      if (proposal) { onProposal(proposal); setMessages((current) => current.map((item, index) => index === current.length - 1 && item.role === 'assistant' && !item.content ? { ...item, content: 'Note update proposal ready for review.' } : item)); }
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'The agent failed safely.' }]); }
    finally { setBusy(false); setActivity(''); abortRef.current = null; }
  }

  function clearChat() {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setInput('');
    setBusy(false);
    setActivity('');
  }

  return <aside className="chat-panel agent-panel"><header className="chat-header"><div><p className="eyebrow">Morrow AI</p><h2>Chat with your agent</h2></div><div className="chat-header-actions"><button className="icon-button" onClick={clearChat} aria-label="Clear chat" title="Clear chat"><Eraser size={16} /></button><button className="icon-button" onClick={onClose} aria-label="Close AI agent"><X size={17} /></button></div></header><div className="agent-messages">{messages.length === 0 && !busy && <div className="agent-empty"><strong>What would you like to do?</strong><p>Your agent can read and propose updates to the active note.</p><div className="suggestions"><button onClick={() => void send('Summarize the active note.')}>Summarize this note</button><button onClick={() => void send('Improve the active note while preserving my voice.')}>Improve this note</button></div></div>}{messages.map((message, index) => <div className={`agent-message ${message.role}`} key={`${message.role}-${index}`}>{message.content ? <span>{message.content}</span> : null}</div>)}{busy && <WorkingIndicator message={activity || 'Agent is working'} />}</div><div className="chat-input"><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask your note agent…" aria-label="Chat message" rows={1} disabled={busy} /><button onClick={() => busy ? abortRef.current?.abort() : void send()} aria-label={busy ? 'Stop agent' : 'Send message'}>{busy ? <Square size={14} /> : <Send size={14} />}</button></div><p className="chat-hint">Shift+Enter for a new line · Agent edits stay pending until you accept them.</p></aside>;
}
