'use client';

import { useRef, useState } from 'react';
import { Activity, Check, ChevronRight, ListTodo, MessageCircle, Send, Square, X } from 'lucide-react';

type NoteContext = { id: string; title: string; content_markdown: string; folder_id: string | null; version: number };
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function AgentPanel({ activeNote, notes, onClose }: { activeNote: NoteContext | null; notes: NoteContext[]; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attached, setAttached] = useState<string[]>([]);
  const [tab, setTab] = useState<'conversation' | 'plan' | 'activity'>('conversation');
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState<string[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  async function send(message = input) {
    const text = message.trim();
    if (!text || busy) return;
    const nextMessages = [...messages, { role: 'user' as const, content: text }];
    setMessages(nextMessages);
    setInput(''); setBusy(true); setActivity((current) => [`Sent request with ${attached.length} attached note${attached.length === 1 ? '' : 's'}.`, ...current]);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch('/api/ai/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages, activeNote: activeNote && { id: activeNote.id, title: activeNote.title, content: activeNote.content_markdown, version: activeNote.version }, selection: { text: '' }, cursor: {}, attachedNoteIds: attached }), signal: controller.signal });
      if (!response.ok || !response.body) { const body = await response.json().catch(() => null) as { error?: string } | null; throw new Error(body?.error ?? 'The agent could not respond.'); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let answer = '';
      setMessages((current) => [...current, { role: 'assistant', content: '' }]);
      while (true) { const chunk = await reader.read(); if (chunk.done) break; answer += decoder.decode(chunk.value, { stream: true }); setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: answer } : item)); }
      setActivity((current) => ['Agent response completed.', ...current]);
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'The agent failed safely.' }]); }
    finally { setBusy(false); abortRef.current = null; }
  }

  return <aside className="chat-panel agent-panel"><header className="chat-header"><div><p className="eyebrow">Morrow AI</p><h2>Ask about this note</h2><span className="agent-subtitle">Note-aware agent</span></div><button className="icon-button" onClick={onClose} aria-label="Close AI agent"><X size={17} /></button></header><div className="agent-tabs" role="tablist" aria-label="Agent views"><button className={tab === 'conversation' ? 'selected' : ''} onClick={() => setTab('conversation')}><MessageCircle size={13} /> Chat</button><button className={tab === 'plan' ? 'selected' : ''} onClick={() => setTab('plan')}><ListTodo size={13} /> Plan</button><button className={tab === 'activity' ? 'selected' : ''} onClick={() => setTab('activity')}><Activity size={13} /> Activity</button></div>{tab === 'conversation' && <><div className="agent-context"><strong>Context</strong><span>{activeNote ? `Active: ${activeNote.title}` : 'No active note'}</span><details><summary>Attach notes</summary><div className="context-options">{notes.filter((note) => note.id !== activeNote?.id).slice(0, 8).map((note) => <label key={note.id}><input type="checkbox" checked={attached.includes(note.id)} onChange={() => setAttached((current) => current.includes(note.id) ? current.filter((id) => id !== note.id) : [...current, note.id])} /> {note.title}</label>)}</div></details></div><div className="agent-messages">{messages.length === 0 && <div className="agent-empty"><strong>Ask about your notes</strong><p>I can read the active note, search explicitly attached context, and propose changes for your approval.</p><div className="suggestions"><button onClick={() => void send('Summarize the active note.')}>Summarize this note</button><button onClick={() => void send('Find related ideas in the attached notes.')}>Find related ideas</button></div></div>}{messages.map((message, index) => <div className={`agent-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.content || (busy ? 'Thinking…' : '')}</span></div>)}</div></>}{tab === 'plan' && <div className="agent-view"><ListTodo size={18} /><strong>Run plan</strong><p>The agent may read notes automatically, then propose each write action for confirmation.</p><span className="agent-limit">Maximum 6 steps · 45 second timeout</span></div>}{tab === 'activity' && <div className="agent-activity">{activity.length ? activity.map((item, index) => <p key={`${item}-${index}`}><Check size={13} /> {item}</p>) : <p>No activity yet.</p>}</div>}<div className="chat-input"><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask anything about your notes…" disabled={busy} /><button onClick={() => busy ? abortRef.current?.abort() : void send()} aria-label={busy ? 'Stop agent' : 'Send message'}>{busy ? <Square size={14} /> : <Send size={14} />}</button></div><p className="chat-hint">Writes are previewed and require your confirmation.</p></aside>;
}
