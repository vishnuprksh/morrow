'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Square, X } from 'lucide-react';
import type { NoteChangeProposal } from '@/lib/ai/proposals';

type NoteContext = { id: string; title: string; content_markdown: string; folder_id: string | null; version: number };
type ChatMessage = { role: 'user' | 'assistant'; content: string };

export function AgentPanel({ activeNote, onClose, onProposal }: { activeNote: NoteContext | null; onClose: () => void; onProposal: (proposal: NoteChangeProposal) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
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
    setInput(''); setBusy(true);
    const controller = new AbortController(); abortRef.current = controller;
    try {
      const response = await fetch('/api/ai/agent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages, activeNote: activeNote && { id: activeNote.id, title: activeNote.title, content: activeNote.content_markdown, version: activeNote.version }, selection: { text: '' }, cursor: {} }), signal: controller.signal });
      if (!response.ok || !response.body) { const body = await response.json().catch(() => null) as { error?: string } | null; throw new Error(body?.error ?? 'The agent could not respond.'); }
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let answer = '';
      setMessages((current) => [...current, { role: 'assistant', content: '' }]);
      while (true) { const chunk = await reader.read(); if (chunk.done) break; answer += decoder.decode(chunk.value, { stream: true }); setMessages((current) => current.map((item, index) => index === current.length - 1 ? { ...item, content: answer } : item)); }
      const proposalMatch = answer.match(/\{"type":"note_change_proposal"[^\n]*\}/);
      if (proposalMatch) {
        try { onProposal(JSON.parse(proposalMatch[0]) as NoteChangeProposal); } catch { /* Keep the prose response when a provider emits malformed JSON. */ }
      }
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessages((current) => [...current, { role: 'assistant', content: error instanceof Error ? error.message : 'The agent failed safely.' }]); }
    finally { setBusy(false); abortRef.current = null; }
  }

  return <aside className="chat-panel agent-panel"><header className="chat-header"><div><p className="eyebrow">Morrow AI</p><h2>Chat with your agent</h2></div><button className="icon-button" onClick={onClose} aria-label="Close AI agent"><X size={17} /></button></header><div className="agent-messages">{messages.length === 0 && <div className="agent-empty"><strong>What would you like to do?</strong><p>Your agent can read and propose updates to the active note.</p><div className="suggestions"><button onClick={() => void send('Summarize the active note.')}>Summarize this note</button><button onClick={() => void send('Improve the active note while preserving my voice.')}>Improve this note</button></div></div>}{messages.map((message, index) => <div className={`agent-message ${message.role}`} key={`${message.role}-${index}`}><span>{message.content || (busy ? 'Thinking…' : '')}</span></div>)}</div><div className="chat-input"><textarea ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void send(); } }} placeholder="Ask your note agent…" aria-label="Chat message" rows={1} disabled={busy} /><button onClick={() => busy ? abortRef.current?.abort() : void send()} aria-label={busy ? 'Stop agent' : 'Send message'}>{busy ? <Square size={14} /> : <Send size={14} />}</button></div><p className="chat-hint">Shift+Enter for a new line · Agent edits stay pending until you accept them.</p></aside>;
}
