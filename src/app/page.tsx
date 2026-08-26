'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Archive, ArchiveRestore, ChevronDown, ChevronRight, FileText, Folder, FolderPlus, GripVertical, MoreHorizontal, PanelRight, Pencil, Plus, Search, Settings, Sparkles, Star, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SignOutButton } from './auth/auth-form';
import { MarkdownEditor } from './editor/markdown-editor';
import { createAutosaveController, readRecoveryCopy, removeRecoveryCopy, type AutosaveController, type NoteDraft, type SaveResult } from '@/lib/notes/autosave';
import { safeFilename } from '@/lib/notes/portability';
import { AgentPanel } from './agent-panel';
import type { NoteChangeProposal } from '@/lib/ai/proposals';

type FolderRow = { id: string; name: string; parent_id: string | null; position: number };
type NoteRow = { id: string; title: string; folder_id: string | null; content_markdown: string; version: number; updated_at: string; is_favorite: boolean; is_archived: boolean };
type NoteAction = 'rename' | 'move' | 'archive' | 'delete';

export default function Home() {
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { display_name?: string } } | null>(null);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ note: NoteRow; x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [folderSaving, setFolderSaving] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderRenameInput, setFolderRenameInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const autosaveRef = useRef<AutosaveController | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const previousNoteRef = useRef<string | null>(null);

  async function loadWorkspace(supabase: ReturnType<typeof createClient>) {
    setLoading(true); setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) { setError(`Could not restore your session: ${authError.message}`); setLoading(false); return; }
    setUser(authData.user);
    if (!authData.user) { setFolders([]); setNotes([]); setSelectedNote(null); setLoading(false); return; }
    const [folderResult, noteResult] = await Promise.all([
      supabase.from('folders').select('id, name, parent_id, position').order('position', { ascending: true }),
      supabase.from('notes').select('id, title, content_markdown, folder_id, version, updated_at, is_favorite, is_archived').order('updated_at', { ascending: false }),
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
    supabaseRef.current = supabase;
    autosaveRef.current = createAutosaveController(async (noteId, draft, expectedVersion): Promise<SaveResult> => {
      const { data, error: updateError } = await supabase.from('notes').update({ ...draft, version: expectedVersion + 1 }).eq('id', noteId).eq('version', expectedVersion).select('version, updated_at').maybeSingle();
      if (updateError) return { status: 'error', error: new Error(updateError.message) };
      if (!data) return { status: 'stale' };
      return { status: 'saved', version: data.version, updated_at: data.updated_at };
    }, ({ noteId, ...result }) => {
      if (result.status === 'saved') {
        setNotes((current) => current.map((note) => note.id === noteId ? { ...note, version: result.version, updated_at: result.updated_at } : note));
        setSaveStatus('saved');
      } else if (result.status === 'stale') {
        setSaveStatus('error');
        setError('This note changed in another tab. Your local draft is preserved for recovery.');
      } else {
        setSaveStatus('error');
        setError(`Could not save your note: ${result.error.message}`);
      }
    });
    void Promise.resolve().then(() => loadWorkspace(supabase));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) void loadWorkspace(supabase);
      else { setFolders([]); setNotes([]); setSelectedNote(null); }
    });
    return () => { listener.subscription.unsubscribe(); autosaveRef.current?.dispose(); autosaveRef.current = null; supabaseRef.current = null; };
  }, []);
  useEffect(() => {
    const previousNote = previousNoteRef.current;
    if (previousNote && previousNote !== selectedNote) void autosaveRef.current?.flush(previousNote);
    previousNoteRef.current = selectedNote;
  }, [selectedNote]);
  const [chatOpen, setChatOpen] = useState(true);
  useEffect(() => { const width = localStorage.getItem('morrow-agent-width'); if (width) document.documentElement.style.setProperty('--agent-width', `${width}px`); }, []);
  const [pendingProposal, setPendingProposal] = useState<NoteChangeProposal | null>(null);
  const selected = notes.find((note) => note.id === selectedNote) ?? null;
  const visibleNotes = useMemo(() => notes.filter((note) => note.is_archived === showArchived && (!showFavorites || note.is_favorite) && (!selectedFolder || note.folder_id === selectedFolder) && note.title.toLowerCase().includes(filter.toLowerCase())), [notes, selectedFolder, filter, showArchived, showFavorites]);
  const folderName = (id: string | null) => id ? folders.find((folder) => folder.id === id)?.name ?? 'Unknown folder' : 'Unfiled';
  function updateNote(noteId: string, changes: Partial<Pick<NoteRow, 'title' | 'content_markdown'>>) {
    const note = notes.find((item) => item.id === noteId);
    if (!note) return;
    const draft: NoteDraft = { title: changes.title ?? note.title, content_markdown: changes.content_markdown ?? note.content_markdown };
    setNotes((current) => current.map((item) => item.id === noteId ? { ...item, ...changes } : item));
    setSaveStatus('saving');
    autosaveRef.current?.schedule(noteId, draft, note.version);
  }
  function openNoteMenu(event: ReactMouseEvent, note: NoteRow) {
    event.preventDefault();
    setContextMenu({ note, x: Math.min(event.clientX, window.innerWidth - 205), y: Math.min(event.clientY, window.innerHeight - 190) });
  }
  async function archiveNote(note: NoteRow) {
    const { error: updateError } = await createClient().from('notes').update({ is_archived: !note.is_archived }).eq('id', note.id);
    if (updateError) return setError(updateError.message);
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, is_archived: !item.is_archived } : item));
    setContextMenu(null);
  }
  async function toggleFavorite(note: NoteRow) {
    const nextValue = !note.is_favorite;
    setError(null);
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, is_favorite: nextValue } : item));
    const { error: updateError } = await createClient().from('notes').update({ is_favorite: nextValue }).eq('id', note.id);
    if (updateError) {
      setNotes((current) => current.map((item) => item.id === note.id ? { ...item, is_favorite: note.is_favorite } : item));
      setError(`Could not update favorite: ${updateError.message}`);
    }
  }
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>('.editor-tools .icon-button:nth-of-type(2)');
    if (!button) return;
    const updateLabel = () => {
      const current = notes.find((note) => note.id === selectedNote)?.is_favorite ?? false;
      button.setAttribute('aria-label', current ? 'Remove from favorites' : 'Add to favorites');
      button.setAttribute('aria-pressed', String(current));
      button.classList.toggle('favorite-active', current);
    };
    const handleClick = () => {
      const note = notes.find((item) => item.id === selectedNote);
      if (note) void toggleFavorite(note);
    };
    button.addEventListener('click', handleClick);
    updateLabel();
    return () => button.removeEventListener('click', handleClick);
  }, [notes, selectedNote]);
  async function moveNote(note: NoteRow, folderId: string | null) {
    setContextMenu(null);
    if (folderId === note.folder_id) return;
    const { error: updateError } = await createClient().from('notes').update({ folder_id: folderId }).eq('id', note.id);
    if (updateError) return setError(updateError.message);
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, folder_id: folderId } : item));
  }
  function acceptProposal(proposal: NoteChangeProposal) {
    const note = notes.find((item) => item.id === proposal.noteId);
    if (!note || note.version !== proposal.expectedVersion || note.content_markdown !== proposal.original) {
      setPendingProposal(null); setError('This proposal is stale because the active note has changed.'); return;
    }
    updateNote(note.id, { content_markdown: proposal.replacement });
    setPendingProposal(null);
  }
  async function createFolder() {
    if (!user) return;
    if (folderSaving) return;
    setFolderSaving(true); setError(null);
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from('folders').insert({ user_id: user.id, name: 'untitled', parent_id: null, position: folders.length }).select('id, name, parent_id, position').single();
    setFolderSaving(false);
    if (insertError) return setError(insertError.message);
    if (data) {
      setFolders((current) => [...current, data]);
      setOpenFolders((current) => ({ ...current, [data.id]: true }));
      setRenamingFolderId(data.id);
      setFolderRenameInput(data.name);
    }
  }
  async function renameFolder(folder: FolderRow) {
    const name = folderRenameInput.trim();
    if (!name) { setError('Folder names cannot be blank.'); return; }
    if (name === folder.name) { setRenamingFolderId(null); return; }
    setFolderSaving(true); setError(null);
    const { error: updateError } = await createClient().from('folders').update({ name }).eq('id', folder.id);
    setFolderSaving(false);
    if (updateError) return setError(updateError.message);
    setFolders((current) => current.map((item) => item.id === folder.id ? { ...item, name } : item));
    setRenamingFolderId(null);
  }
  async function createNote() {
    if (!user) return;
    const supabase = createClient();
    const { data, error: insertError } = await supabase.from('notes').insert({ user_id: user.id, title: 'Untitled note', folder_id: selectedFolder, content_markdown: '' }).select('id, title, folder_id, content_markdown, version, updated_at, is_favorite, is_archived').single();
    if (insertError) return setError(insertError.message);
    if (data) { setNotes((current) => [data, ...current]); setSelectedNote(data.id); }
  }
  async function deleteNote(note: NoteRow) {
    if (!window.confirm(`Delete “${note.title}”? This cannot be undone.`)) return;
    autosaveRef.current?.cancel(note.id);
    removeRecoveryCopy(note.id);
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
  async function uploadImage(file: File) {
    if (!selected || !user) return null;
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Images must be PNG, JPEG, GIF, WebP or SVG and smaller than 5 MB.'); return null; }
    const filename = `${crypto.randomUUID()}-${safeFilename(file.name, 'image')}`;
    const { error: uploadError } = await createClient().storage.from('attachments').upload(`${user.id}/${selected.id}/${filename}`, file, { contentType: file.type });
    if (uploadError) { setError(`Could not upload image: ${uploadError.message}`); return null; }
    return `/api/attachments/${selected.id}/${encodeURIComponent(filename)}`;
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={15} /></div><span>Morrow</span></div>
        <div className="sidebar-actions"><button className="new-note" onClick={createNote}><Plus size={16} /> New note</button><button className="icon-button" aria-label="Search"><Search size={17} /></button></div>
        <nav className="nav-list"><button className={`nav-item ${selectedFolder === null && !showArchived && !showFavorites ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setShowArchived(false); setShowFavorites(false); }}><FileText size={16} /> All notes <span>{notes.filter((note) => !note.is_archived).length}</span></button><button className={`nav-item ${showFavorites ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setShowArchived(false); setShowFavorites(true); }}><Star size={16} /> Favorites <span>{notes.filter((note) => note.is_favorite && !note.is_archived).length}</span></button><button className={`nav-item ${showArchived ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setShowArchived(true); setShowFavorites(false); }}><Archive size={16} /> Archive <span>{notes.filter((note) => note.is_archived).length}</span></button></nav>
        <div className="section-heading"><span>Folders</span><button aria-label="Add folder" onClick={() => void createFolder()} disabled={folderSaving}><FolderPlus size={15} /></button></div>
        <div className="folder-list">{folders.map((folder) => <div className={`folder-row ${selectedFolder === folder.id ? 'selected' : ''}`} key={folder.id}><button className="folder-toggle" onClick={() => { setSelectedFolder(folder.id); setOpenFolders((current) => ({ ...current, [folder.id]: !current[folder.id] })); }} aria-label={`Toggle ${folder.name}`}><span className="folder-icon">{openFolders[folder.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Folder size={15} /></span>{renamingFolderId === folder.id ? <input className="folder-rename-input" aria-label={`Rename ${folder.name}`} autoFocus value={folderRenameInput} maxLength={120} onChange={(event) => setFolderRenameInput(event.target.value)} onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} onBlur={() => void renameFolder(folder)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void renameFolder(folder); } if (event.key === 'Escape') { setRenamingFolderId(null); } }} /> : <span onDoubleClick={(event) => { event.stopPropagation(); setRenamingFolderId(folder.id); setFolderRenameInput(folder.name); }}>{folder.name}</span>}</button><span className="muted-count">{notes.filter((note) => note.folder_id === folder.id).length}</span><button className="folder-delete" aria-label={`Delete ${folder.name}`} onClick={() => deleteFolder(folder)}><Trash2 size={13} /></button></div>)}</div>
        <div className="sidebar-footer"><div className="avatar">{(user?.user_metadata?.display_name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}</div><div className="profile"><strong>{user?.user_metadata?.display_name ?? user?.email}</strong><small>Personal workspace</small></div><Link className="icon-button" href="/settings" aria-label="Open settings"><Settings size={16} /></Link><SignOutButton /></div>
      </aside>
      <section className="notes-panel"><div className="panel-header"><div><p className="eyebrow">Personal workspace</p><h2>{showArchived ? 'Archive' : selectedFolder ? folderName(selectedFolder) : 'All notes'}</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="note-search"><Search size={15} /><input placeholder="Filter notes" value={filter} onChange={(event) => setFilter(event.target.value)} /></div>{error && <p className="workspace-error" role="alert">{error}</p>}{loading ? <p className="workspace-message">Loading your notes…</p> : <div className="note-list">{visibleNotes.map((note) => <button className={`note-card ${note.id === selectedNote ? 'active' : ''}`} key={note.id} onClick={() => setSelectedNote(note.id)} onContextMenu={(event) => openNoteMenu(event, note)}><div className="note-card-icon"><FileText size={16} /></div><div><strong>{note.title}</strong><small>{folderName(note.folder_id)} · {new Date(note.updated_at).toLocaleDateString()}</small></div></button>)}{visibleNotes.length === 0 && <p className="workspace-message">No notes here yet.</p>}</div>}<button className="add-note" onClick={createNote}><Plus size={16} /> Add a note</button>{contextMenu && <NoteContextMenu menu={contextMenu} folders={folders} onRename={() => { setSelectedNote(contextMenu.note.id); setContextMenu(null); requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.title-input')?.focus()); }} onArchive={() => void archiveNote(contextMenu.note)} onDelete={() => void deleteNote(contextMenu.note)} onMove={(folderId) => void moveNote(contextMenu.note, folderId)} onClose={() => setContextMenu(null)} />}</section>
      <section className="editor"><header className="editor-header"><div className="breadcrumbs"><span>{folderName(selected?.folder_id ?? null)}</span><span>/</span><span>{selected?.title ?? 'No note selected'}</span></div><div className="editor-tools"><span className="save-status"><span className={saveStatus === 'error' ? 'save-error-dot' : saveStatus === 'saving' ? 'saving-dot' : 'saved-dot'} /> {saveStatus === 'error' ? 'Save failed' : saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span><button className="icon-button" disabled={!selected} onClick={() => selected && deleteNote(selected)} aria-label="Delete note"><Trash2 size={16} /></button><button className="icon-button"><Star size={17} /></button><button className="icon-button" onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle AI chat"><PanelRight size={17} /></button></div></header><div className="editor-content">{selected ? <><RecoveryNotice note={selected} onRecover={(draft) => { setNotes((current) => current.map((item) => item.id === selected.id ? { ...item, ...draft } : item)); autosaveRef.current?.schedule(selected.id, draft, selected.version); setSaveStatus('saving'); }} /><input className="title-input" value={selected.title} onChange={(event) => updateNote(selected.id, { title: event.target.value })} aria-label="Note title" /><MarkdownEditor value={selected.content_markdown} onChange={(content_markdown) => updateNote(selected.id, { content_markdown })} onUploadImage={uploadImage} proposal={pendingProposal?.noteId === selected.id ? pendingProposal : null} onAcceptProposal={acceptProposal} onDiscardProposal={() => setPendingProposal(null)} /></> : <div className="workspace-message" aria-label="Markdown note content">Create a note to start writing.</div>}</div></section>
      {chatOpen && <><div className="agent-resize-handle" role="separator" aria-label="Resize agent sidebar" onMouseDown={(event) => { const startX = event.clientX; const startWidth = Number.parseInt(localStorage.getItem('morrow-agent-width') ?? '315', 10); const move = (moveEvent: MouseEvent) => { const width = Math.min(520, Math.max(260, startWidth - (moveEvent.clientX - startX))); document.documentElement.style.setProperty('--agent-width', `${width}px`); localStorage.setItem('morrow-agent-width', String(width)); }; const stop = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', stop); }}><GripVertical size={14} /></div><AgentPanel activeNote={selected} onProposal={(proposal) => { if (!pendingProposal) setPendingProposal(proposal); }} onClose={() => setChatOpen(false)} /></>}
    </main>
  );
}

function RecoveryNotice({ note, onRecover }: { note: NoteRow; onRecover: (draft: NoteDraft) => void }) {
  const recovery = readRecoveryCopy(note.id);
  if (!recovery || (recovery.title === note.title && recovery.content_markdown === note.content_markdown)) return null;
  return <div className="workspace-error" role="status">A local recovery copy is available. <button type="button" onClick={() => { onRecover(recovery); removeRecoveryCopy(note.id); }}>Restore draft</button></div>;
}

function NoteContextMenu({ menu, folders, onRename, onArchive, onDelete, onMove, onClose }: { menu: { note: NoteRow; x: number; y: number }; folders: FolderRow[]; onRename: () => void; onArchive: () => void; onDelete: () => void; onMove: (folderId: string | null) => void; onClose: () => void }) {
  return <><div className="context-menu-dismiss" onClick={onClose} aria-hidden="true" /><div className="note-context-menu" style={{ left: menu.x, top: menu.y }} role="menu" aria-label={`Actions for ${menu.note.title}`}><button role="menuitem" onClick={onRename}><Pencil size={14} /> Rename</button><label className="move-note-item"><Folder size={14} /> Move to <select aria-label={`Move ${menu.note.title} to`} value={menu.note.folder_id ?? ''} onChange={(event) => onMove(event.target.value || null)}><option value="">Unfiled</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label><button role="menuitem" onClick={onArchive}>{menu.note.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />} {menu.note.is_archived ? 'Unarchive' : 'Archive'}</button><button className="danger-action" role="menuitem" onClick={onDelete}><Trash2 size={14} /> Delete</button></div></>;
}
