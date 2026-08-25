'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Archive, ChevronDown, ChevronRight, FileText, Folder, FolderPlus, MoreHorizontal, PanelRight, Plus, Search, Sparkles, Star, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SignOutButton } from './auth/auth-form';

type FolderRow = { id: string; name: string; parent_id: string | null; position: number };
type NoteRow = { id: string; title: string; folder_id: string | null; content_markdown: string; updated_at: string };

export default function Home() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { display_name?: string } } | null>(null);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderSaving, setFolderSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const saveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  async function loadWorkspace(supabase: ReturnType<typeof createClient>) {
    setLoading(true); setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) { setError(`Could not restore your session: ${authError.message}`); setLoading(false); return; }
    setUser(authData.user);
    if (!authData.user) { setFolders([]); setNotes([]); setSelectedNote(null); setLoading(false); return; }
    const [folderResult, noteResult] = await Promise.all([
      supabase.from('folders').select('id, name, parent_id, position').order('position', { ascending: true }),
      supabase.from('notes').select('id, title, content_markdown, folder_id, updated_at').order('updated_at', { ascending: false }),
    ]);
    if (folderResult.error || noteResult.error) {
      setError(`Could not load your workspace: ${folderResult.error?.message ?? noteResult.error?.message ?? 'Unknown error'}`);
      setLoading(false); return;
    }
    const nextFolders = folderResult.data ?? [];
    const nextNotes = noteResult.data ?? [];
    setFolders(nextFolders); setNotes(nextNotes);
    setOpenFolders(Object.fromEntries(nextFolders.map((folder) => [folder.id, true])));
    setSelectedNote((current) => current && nextNotes.some((note) => note.id === current) ? current : nextNotes[0]?.id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    let supabase;
    try { supabase = createClient(); } catch { return; }
    void Promise.resolve().then(() => loadWorkspace(supabase));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadWorkspace(supabase);
      else { setFolders([]); setNotes([]); setSelectedNote(null); }
    });
    const timers = saveTimers.current;
    return () => { listener.subscription.unsubscribe(); Object.values(timers).forEach(clearTimeout); };
  }, []);
  const [chatOpen, setChatOpen] = useState(true);
  const selected = notes.find((note) => note.id === selectedNote) ?? null;
  const visibleNotes = useMemo(() => notes.filter((note) => (!selectedFolder || note.folder_id === selectedFolder) && note.title.toLowerCase().includes(filter.toLowerCase())), [notes, selectedFolder, filter]);
  const folderName = (id: string | null) => id ? folders.find((folder) => folder.id === id)?.name ?? 'Unknown folder' : 'Unfiled';
  function updateNote(noteId: string, changes: Partial<Pick<NoteRow, 'title' | 'content_markdown'>>) {
    setNotes((current) => current.map((note) => note.id === noteId ? { ...note, ...changes } : note));
    setSaveStatus('saving');
    if (saveTimers.current[noteId]) clearTimeout(saveTimers.current[noteId]);
    saveTimers.current[noteId] = setTimeout(async () => {
      const { data, error: updateError } = await createClient().from('notes').update(changes).eq('id', noteId).select('updated_at').single();
      if (updateError) { setSaveStatus('error'); setError(`Could not save your note: ${updateError.message}`); return; }
      setNotes((current) => current.map((note) => note.id === noteId ? { ...note, updated_at: data.updated_at } : note));
      setSaveStatus('saved');
    }, 800);
  }
  async function createFolder() {
    if (!user) return;
    const name = folderNameInput.trim();
    if (!name || folderSaving) return;
    setFolderSaving(true); setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from('folders').insert({ user_id: user.id, name, parent_id: null, position: folders.length }).select('id, name, parent_id, position').single();
    setFolderSaving(false);
    if (insertError) return setError(insertError.message);
    if (data) { setFolders((current) => [...current, data]); setFolderNameInput(''); setFolderDialogOpen(false); }
  }
  async function createNote() {
    if (!user) return;
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from('notes').insert({ user_id: user.id, title: 'Untitled note', folder_id: selectedFolder, content_markdown: '' }).select('id, title, folder_id, content_markdown, updated_at').single();
    if (insertError) return setError(insertError.message);
    if (data) { setNotes((current) => [data, ...current]); setSelectedNote(data.id); }
  }
  async function deleteNote(note: NoteRow) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    const { error: deleteError } = await createClient().from('notes').delete().eq('id', note.id);
    if (deleteError) return setError(deleteError.message);
    const remaining = notes.filter((item) => item.id !== note.id); setNotes(remaining); setSelectedNote(remaining[0]?.id ?? null);
  }
  async function deleteFolder(folder: FolderRow) {
    if (!window.confirm(`Delete “${folder.name}”? Notes will become unfiled.`)) return;
    const { error: deleteError } = await createClient().from('folders').delete().eq('id', folder.id);
    if (deleteError) return setError(deleteError.message);
    setFolders((current) => current.filter((item) => item.id !== folder.id)); setNotes((current) => current.map((note) => note.folder_id === folder.id ? { ...note, folder_id: null } : note)); if (selectedFolder === folder.id) setSelectedFolder(null);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={15} /></div><span>Morrow</span></div>
        <div className="sidebar-actions"><button className="new-note" onClick={createNote}><Plus size={16} /> New note</button><button className="icon-button" aria-label="Search"><Search size={17} /></button></div>
        <nav className="nav-list"><button className={`nav-item ${selectedFolder === null ? 'selected' : ''}`} onClick={() => setSelectedFolder(null)}><FileText size={16} /> All notes <span>{notes.length}</span></button><button className="nav-item"><Star size={16} /> Favorites</button><button className="nav-item"><Archive size={16} /> Archive</button></nav>
        <div className="section-heading"><span>Folders</span><button aria-label="Add folder" onClick={() => { setError(null); setFolderDialogOpen(true); }}><FolderPlus size={15} /></button></div>
        <div className="folder-list">{folders.map((folder) => <div className={`folder-row ${selectedFolder === folder.id ? 'selected' : ''}`} key={folder.id}><button className="folder-toggle" onClick={() => { setSelectedFolder(folder.id); setOpenFolders((current) => ({ ...current, [folder.id]: !current[folder.id] })); }} aria-label={`Toggle ${folder.name}`}>{openFolders[folder.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Folder size={15} /> <span>{folder.name}</span></button><span className="muted-count">{notes.filter((note) => note.folder_id === folder.id).length}</span><button className="folder-delete" aria-label={`Delete ${folder.name}`} onClick={() => deleteFolder(folder)}><Trash2 size={13} /></button></div>)}</div>
        {folderDialogOpen && <div className="folder-dialog" role="dialog" aria-modal="true" aria-labelledby="new-folder-title"><h3 id="new-folder-title">New folder</h3><form onSubmit={(event) => { event.preventDefault(); void createFolder(); }}><label htmlFor="folder-name">Folder name</label><input id="folder-name" autoFocus value={folderNameInput} onChange={(event) => setFolderNameInput(event.target.value)} placeholder="e.g. Ideas" maxLength={120} /><div className="folder-dialog-actions"><button type="button" onClick={() => { setFolderDialogOpen(false); setFolderNameInput(''); }}>Cancel</button><button type="submit" disabled={!folderNameInput.trim() || folderSaving}>{folderSaving ? 'Creating…' : 'Create folder'}</button></div></form></div>}
        <div className="sidebar-footer"><div className="avatar">{(user?.user_metadata?.display_name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}</div><div className="profile"><strong>{user?.user_metadata?.display_name ?? user?.email}</strong><small>Personal workspace</small></div><SignOutButton /></div>
      </aside>
      <section className="notes-panel"><div className="panel-header"><div><p className="eyebrow">Personal workspace</p><h2>{selectedFolder ? folderName(selectedFolder) : 'All notes'}</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="note-search"><Search size={15} /><input placeholder="Filter notes" value={filter} onChange={(event) => setFilter(event.target.value)} /></div>{error && <p className="workspace-error" role="alert">{error}</p>}{loading ? <p className="workspace-message">Loading your notes…</p> : <div className="note-list">{visibleNotes.map((note) => <button className={`note-card ${note.id === selectedNote ? 'active' : ''}`} key={note.id} onClick={() => setSelectedNote(note.id)}><div className="note-card-icon"><FileText size={16} /></div><div><strong>{note.title}</strong><small>{folderName(note.folder_id)} · {new Date(note.updated_at).toLocaleDateString()}</small></div></button>)}{visibleNotes.length === 0 && <p className="workspace-message">No notes here yet.</p>}</div>}<button className="add-note" onClick={createNote}><Plus size={16} /> Add a note</button></section>
      <section className="editor"><header className="editor-header"><div className="breadcrumbs"><span>{folderName(selected?.folder_id ?? null)}</span><span>/</span><span>{selected?.title ?? 'No note selected'}</span></div><div className="editor-tools"><span className="save-status"><span className={saveStatus === 'error' ? 'save-error-dot' : saveStatus === 'saving' ? 'saving-dot' : 'saved-dot'} /> {saveStatus === 'error' ? 'Save failed' : saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span><button className="icon-button" disabled={!selected} onClick={() => selected && deleteNote(selected)} aria-label="Delete note"><Trash2 size={16} /></button><button className="icon-button"><Star size={17} /></button><button className="icon-button" onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle AI chat"><PanelRight size={17} /></button></div></header><div className="editor-content">{selected ? <><input className="title-input" value={selected.title} onChange={(event) => updateNote(selected.id, { title: event.target.value })} aria-label="Note title" /><div className="formatting"><button><strong>B</strong></button><button><em>I</em></button><button><s>S</s></button><span /><button>H1</button><button>☷</button><button>❝</button><button>&lt;/&gt;</button><button>↗</button></div><textarea value={selected.content_markdown} onChange={(event) => updateNote(selected.id, { content_markdown: event.target.value })} aria-label="Markdown note content" /></> : <><div className="workspace-message">Create a note to start writing.</div><textarea aria-label="Markdown note content" readOnly /></>}</div></section>
      {chatOpen && <aside className="chat-panel"><header className="chat-header"><div><p className="eyebrow">Morrow AI</p><h2>Ask about this note</h2></div><button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close AI chat"><PanelRight size={17} /></button></header><div className="chat-body"><div className="assistant-badge"><Sparkles size={16} /></div><h3>What would you like to explore?</h3><p>I can help you develop ideas, summarize this note, or find connections in your thinking.</p><div className="suggestions"><button>Summarize this note</button><button>Help me expand this idea</button></div></div><div className="chat-input"><input placeholder="Ask anything..." /><button aria-label="Send message"><ChevronRight size={18} /></button></div><p className="chat-hint">AI can make mistakes. Check important details.</p></aside>}
    </main>
  );
}
