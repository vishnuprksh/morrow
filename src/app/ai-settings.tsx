'use client';

import { useEffect, useState } from 'react';
import { KeyRound, X } from 'lucide-react';

type Credential = { provider: 'openrouter' | 'openai-compatible'; model: string; configured: boolean } | null;

export function AiSettings({ onClose }: { onClose: () => void }) {
  const [credential, setCredential] = useState<Credential>(null);
  const [provider, setProvider] = useState<'openrouter' | 'openai-compatible'>('openrouter');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('openai/gpt-4o-mini');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { void fetch('/api/ai/settings').then((response) => response.json()).then((body) => { if (body.credential) { setCredential(body.credential); setProvider(body.credential.provider); setModel(body.credential.model); } }); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setStatus(null);
    const response = await fetch('/api/ai/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey, model }) });
    const body = await response.json(); setBusy(false); setStatus(body.error ?? 'Saved securely.'); if (!body.error) { setCredential(body.credential); setApiKey(''); }
  }
  async function test() {
    setBusy(true); setStatus(null); const response = await fetch('/api/ai/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider, apiKey: apiKey || 'stored-key', model }) }); const body = await response.json(); setBusy(false); setStatus(body.error ?? body.message);
  }
  async function remove() { setBusy(true); await fetch('/api/ai/settings', { method: 'DELETE' }); setCredential(null); setApiKey(''); setBusy(false); setStatus('Credential deleted.'); }

  return <div className="settings-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}><section className="settings-card" role="dialog" aria-modal="true" aria-labelledby="ai-settings-title"><header><div><p className="eyebrow">Morrow AI</p><h2 id="ai-settings-title">AI settings</h2></div><button className="icon-button" onClick={onClose} aria-label="Close AI settings"><X size={17} /></button></header><p className="settings-intro">Bring your own API key. It is encrypted on the server and never sent back to your browser.</p><form className="settings-form" onSubmit={save}><label>Provider<select value={provider} onChange={(event) => setProvider(event.target.value as typeof provider)}><option value="openrouter">OpenRouter</option><option value="openai-compatible">OpenAI-compatible endpoint</option></select></label><label>Model identifier<input value={model} onChange={(event) => setModel(event.target.value)} placeholder="openai/gpt-4o-mini" required /></label><label>API key<input type="password" value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder={credential ? 'Saved key — enter a new key to replace' : 'sk-…'} required={!credential} autoComplete="new-password" /></label>{status && <p className={status.includes('successful') || status.includes('Saved') || status.includes('deleted') ? 'settings-message' : 'auth-error'} role="status">{status}</p>}<div className="settings-actions"><button className="auth-submit" disabled={busy || (!credential && !apiKey)}>{busy ? 'Working…' : credential ? 'Replace key' : 'Save securely'}</button><button type="button" className="settings-secondary" disabled={busy || !credential} onClick={test}>Test connection</button></div></form>{credential && <div className="credential-status"><KeyRound size={15} /><span>Configured · {credential.provider} · {credential.model}</span><button type="button" onClick={remove}>Delete credential</button></div>}</section></div>;
}
