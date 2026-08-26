'use client';

import { useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';

type Agent = { provider: string; model: string; configured: boolean } | null;

export function AiSettings({ onClose }: { onClose: () => void }) {
  const [agent, setAgent] = useState<Agent>(null);

  useEffect(() => { void fetch('/api/ai/settings').then((response) => response.json()).then((body) => setAgent(body.agent ?? null)); }, []);

  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="settings-card" role="dialog" aria-modal="true" aria-labelledby="ai-settings-title"><header><div><p className="eyebrow">Morrow AI</p><h2 id="ai-settings-title">Built-in AI agent</h2></div><button className="icon-button" onClick={onClose} aria-label="Close AI settings"><X size={17} /></button></header><div className="agent-settings-summary"><Bot size={28} /><div><strong>Chat with your note agent</strong><p>The app uses a server-side OpenRouter connection. Your API key is managed by the application and is never requested or sent to your browser.</p></div></div>{agent && <div className={`credential-status ${agent.configured ? '' : 'agent-unconfigured'}`}><span>{agent.configured ? 'Ready' : 'Not configured'} · {agent.provider} · {agent.model}</span></div>}</section></div>;
}
