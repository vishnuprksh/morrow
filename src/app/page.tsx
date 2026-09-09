'use client';

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { Archive, ArchiveRestore, Check, ChevronDown, ChevronRight, Code2, FileText, Folder, FolderPlus, GripVertical, ImagePlus, MoreHorizontal, PanelRight, Pencil, PenLine, Plus, Search, Settings, Sparkles, Star, Trash2, Undo2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SignOutButton } from './auth/auth-form';
import { MarkdownEditor } from './editor/markdown-editor';
import { createAutosaveController, readRecoveryCopy, removeRecoveryCopy, type AutosaveController, type NoteDraft, type SaveResult } from '@/lib/notes/autosave';
import { collectFolderIds } from '@/lib/notes/folders';
import { safeFilename } from '@/lib/notes/portability';
import { imageContentType, imageLookup, imageReferences, parseVaultFiles, rewriteImageLinks, type VaultImage, type VaultNote } from '@/lib/notes/vault-import';
import { AgentPanel } from './agent-panel';
import type { NoteChangeProposal } from '@/lib/ai/proposals';

type FolderRow = { id: string; name: string; parent_id: string | null; position: number };
type NoteRow = { id: string; title: string; folder_id: string | null; content_markdown: string; version: number; updated_at: string; is_favorite: boolean; is_archived: boolean; deleted_at: string | null };
type NoteView = 'all' | 'favorites' | 'archive' | 'trash' | 'folder';

function WorkspaceLoadingScreen() {
  return <main className="workspace-loading" role="status" aria-live="polite"><div className="workspace-loading-card"><div className="workspace-loading-mark"><Sparkles size={18} /></div><p className="workspace-loading-brand">Morrow</p><div className="loading-spinner" aria-hidden="true" /><p>Preparing your workspace…</p></div></main>;
}

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { display_name?: string } } | null>(null);
  const [folders, setFolders] = useState<FolderRow[]>([]);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [noteView, setNoteView] = useState<NoteView>('all');
  const [contextMenu, setContextMenu] = useState<{ note: NoteRow; x: number; y: number } | null>(null);
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
  const [notesMenuOpen, setNotesMenuOpen] = useState(false);
  const [selectingNotes, setSelectingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [folderSaving, setFolderSaving] = useState(false);
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null);
  const [folderRenameInput, setFolderRenameInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [rawMarkdown, setRawMarkdown] = useState(false);
  const [vaultPreview, setVaultPreview] = useState<{ notes: VaultNote[]; images: VaultImage[]; ignored: string[]; vaultName: string } | null>(null);
  const [vaultImported, setVaultImported] = useState(false);
  const [importingVault, setImportingVault] = useState(false);
  const [vaultProgress, setVaultProgress] = useState<{ completed: number; total: number; current: string } | null>(null);
  const autosaveRef = useRef<AutosaveController | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null);
  const previousNoteRef = useRef<string | null>(null);

  async function loadWorkspace(supabase: ReturnType<typeof createClient>) {
    setLoading(true); setError(null);
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) { router.replace('/auth/sign-in'); return; }
    setUser(authData.user);
    if (!authData.user) { router.replace('/auth/sign-in'); return; }
    const [folderResult, noteResult] = await Promise.all([
      supabase.from('folders').select('id, name, parent_id, position').order('position', { ascending: true }),
      supabase.from('notes').select('id, title, content_markdown, folder_id, version, updated_at, is_favorite, is_archived, deleted_at').order('updated_at', { ascending: false }),
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
    try { supabase = createClient(); } catch { window.setTimeout(() => { setError('Could not connect to authentication. Check your Supabase configuration.'); setLoading(false); }, 0); return; }
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
      else { setFolders([]); setNotes([]); setSelectedNote(null); router.replace('/auth/sign-in'); }
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
  const visibleNotes = useMemo(() => notes.filter((note) => {
    if (noteView === 'trash') return note.deleted_at !== null;
    if (note.deleted_at !== null) return false;
    if (noteView === 'archive') return note.is_archived;
    if (noteView === 'favorites') return note.is_favorite && !note.is_archived;
    if (noteView === 'folder') return !note.is_archived && note.folder_id === selectedFolder;
    return !note.is_archived;
  }).filter((note) => note.title.toLowerCase().includes(filter.toLowerCase())), [notes, selectedFolder, filter, noteView]);
  const folderName = (id: string | null) => id ? folders.find((folder) => folder.id === id)?.name ?? 'Unknown folder' : 'Unfiled';
  function updateNote(noteId: string, changes: Partial<Pick<NoteRow, 'title' | 'content_markdown'>>) {
    const note = notes.find((item) => item.id === noteId);
    if (!note || note.deleted_at) return;
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
  function toggleSelectNotes() {
    setNotesMenuOpen(false);
    setSelectingNotes((current) => {
      const next = !current;
      if (!next) setSelectedNoteIds(new Set());
      return next;
    });
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
    const { data, error: insertError } = await supabase.from('notes').insert({ user_id: user.id, title: 'Untitled note', folder_id: selectedFolder, content_markdown: '' }).select('id, title, folder_id, content_markdown, version, updated_at, is_favorite, is_archived, deleted_at').single();
    if (insertError) return setError(insertError.message);
    if (data) { setNotes((current) => [data, ...current]); setSelectedNote(data.id); }
  }
  async function moveToTrash(note: NoteRow) {
    if (!window.confirm(`Move “${note.title}” to Trash?`)) return;
    autosaveRef.current?.cancel(note.id);
    removeRecoveryCopy(note.id);
    const deletedAt = new Date().toISOString();
    const { error: updateError } = await createClient().from('notes').update({ deleted_at: deletedAt }).eq('id', note.id);
    if (updateError) return setError(updateError.message);
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, deleted_at: deletedAt } : item));
    setSelectedNote((current) => current === note.id ? notes.find((item) => item.id !== note.id && item.deleted_at === null)?.id ?? null : current);
    setSelectedNoteIds((current) => { const next = new Set(current); next.delete(note.id); return next; });
    setContextMenu(null);
  }
  const deleteNote = moveToTrash;
  async function restoreNote(note: NoteRow) {
    const { error: updateError } = await createClient().from('notes').update({ deleted_at: null }).eq('id', note.id);
    if (updateError) return setError(updateError.message);
    setNotes((current) => current.map((item) => item.id === note.id ? { ...item, deleted_at: null } : item));
    setContextMenu(null);
  }
  async function permanentlyDeleteNote(note: NoteRow) {
    if (!window.confirm(`Permanently delete “${note.title}”? This cannot be undone.`)) return;
    const { error: deleteError } = await createClient().from('notes').delete().eq('id', note.id);
    if (deleteError) return setError(deleteError.message);
    setNotes((current) => current.filter((item) => item.id !== note.id));
    setSelectedNote((current) => current === note.id ? null : current);
    setContextMenu(null);
  }
  async function bulkMoveToTrash() {
    const ids = [...selectedNoteIds].filter((id) => visibleNotes.some((note) => note.id === id && note.deleted_at === null));
    if (!ids.length || !window.confirm(`Move ${ids.length} notes to Trash?`)) return;
    const deletedAt = new Date().toISOString();
    const { error: updateError } = await createClient().from('notes').update({ deleted_at: deletedAt }).in('id', ids);
    if (updateError) return setError(updateError.message);
    setNotes((current) => current.map((note) => ids.includes(note.id) ? { ...note, deleted_at: deletedAt } : note));
    setSelectedNoteIds(new Set());
    setContextMenu(null);
    if (selectedNote && ids.includes(selectedNote)) setSelectedNote(notes.find((note) => !ids.includes(note.id) && note.deleted_at === null)?.id ?? null);
  }
  async function deleteFolder(folder: FolderRow) {
    const folderIds = collectFolderIds(folder.id, folders);
    const noteCount = notes.filter((note) => note.folder_id && folderIds.includes(note.folder_id)).length;
    if (!window.confirm(`Delete “${folder.name}”? This deletes ${noteCount} note${noteCount === 1 ? '' : 's'} in this folder and any subfolders.`)) return;
    const supabase = createClient();
    const { error: deleteNotesError } = await supabase.from('notes').delete().in('folder_id', folderIds);
    if (deleteNotesError) return setError(deleteNotesError.message);
    const { error: deleteFolderError } = await supabase.from('folders').delete().in('id', folderIds);
    if (deleteFolderError) return setError(deleteFolderError.message);
    setFolders((current) => current.filter((item) => !folderIds.includes(item.id)));
    setNotes((current) => current.filter((note) => !note.folder_id || !folderIds.includes(note.folder_id)));
    if (selectedFolder && folderIds.includes(selectedFolder)) setSelectedFolder(null);
    setSelectedNote((current) => current && notes.some((note) => note.id === current && note.folder_id && folderIds.includes(note.folder_id)) ? null : current);
    setContextMenu(null);
  }
  async function uploadImage(file: File) {
    if (!selected || selected.deleted_at || !user) return null;
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'].includes(file.type) || file.size > 5 * 1024 * 1024) { setError('Images must be PNG, JPEG, GIF, WebP or SVG and smaller than 5 MB.'); return null; }
    const filename = `${crypto.randomUUID()}-${safeFilename(file.name, 'image')}`;
    const { error: uploadError } = await createClient().storage.from('attachments').upload(`${user.id}/${selected.id}/${filename}`, file, { contentType: file.type });
    if (uploadError) { setError(`Could not upload image: ${uploadError.message}`); return null; }
    return `/api/attachments/${selected.id}/${encodeURIComponent(filename)}`;
  }

  function selectVault(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (files) { setVaultImported(false); setVaultPreview(parseVaultFiles(files)); }
    event.target.value = '';
  }

  async function importVault() {
    if (!vaultPreview || !user) return;
    setImportingVault(true); setError(null);
    setVaultProgress({ completed: 0, total: vaultPreview.notes.length + vaultPreview.images.length, current: 'Preparing your vault…' });
    try {
      const supabase = createClient();
      const folderIds = new Map<string, string>();
      const orderedFolders = [...new Set(vaultPreview.notes.flatMap((note) => [vaultPreview.vaultName, ...note.folderPath].map((_, index, path) => path.slice(0, index + 1).join('/'))))].sort((a, b) => a.split('/').length - b.split('/').length);
      for (const path of orderedFolders) {
        const parts = path.split('/');
        const parentPath = parts.slice(0, -1).join('/') || null;
        const { data, error: folderError } = await supabase.from('folders').insert({ user_id: user.id, name: parts.at(-1) ?? 'Folder', parent_id: parentPath ? folderIds.get(parentPath) ?? null : null, position: folders.length + folderIds.size }).select('id').single();
        if (folderError || !data) throw new Error(folderError?.message ?? 'Could not create import folder');
        folderIds.set(path, data.id);
      }
      const images = imageLookup(vaultPreview.images);
      for (const note of vaultPreview.notes) {
        const folderPath = [vaultPreview.vaultName, ...note.folderPath].join('/');
        const { data: importedNote, error: createError } = await supabase.from('notes').insert({ user_id: user.id, title: note.title, folder_id: folderIds.get(folderPath) ?? null, content_markdown: '' }).select('id').single();
        if (createError || !importedNote) throw new Error(createError?.message ?? 'Could not create imported note');
        const uploaded = new Map<string, string>();
        const markdown = await note.file.text();
        for (const reference of imageReferences(markdown)) {
          const image = images.get(reference) ?? images.get(reference.split('/').pop() ?? reference);
          if (!image) continue;
          const filename = `${crypto.randomUUID()}-${safeFilename(image.file.name, 'image')}`;
          const contentType = imageContentType(image.file);
          if (!contentType) throw new Error(`Unsupported image type for ${image.path}`);
          const { error: uploadError } = await supabase.storage.from('attachments').upload(`${user.id}/${importedNote.id}/${filename}`, image.file, { contentType });
          if (uploadError) throw new Error(`Could not upload ${image.path}: ${uploadError.message}`);
          uploaded.set(reference, `/api/attachments/${importedNote.id}/${encodeURIComponent(filename)}`);
          setVaultProgress((current) => current ? { ...current, completed: current.completed + 1, current: image.file.name } : current);
        }
        const content = rewriteImageLinks(markdown, (reference) => uploaded.get(reference) ?? uploaded.get(reference.split('/').pop() ?? reference));
        const { data, error: noteError } = await supabase.from('notes').update({ content_markdown: content }).eq('id', importedNote.id).select('id, title, folder_id, content_markdown, version, updated_at, is_favorite, is_archived, deleted_at').single();
        if (noteError || !data) throw new Error(noteError?.message ?? 'Could not import note');
        setNotes((current) => [data, ...current]);
        setVaultProgress((current) => current ? { ...current, completed: current.completed + 1, current: note.file.name } : current);
      }
      await loadWorkspace(supabase);
      setVaultImported(true);
    } catch (importError) { setError(importError instanceof Error ? importError.message : 'Could not import vault.'); }
    finally { setImportingVault(false); setVaultProgress(null); }
  }

  if (loading && !error) return <WorkspaceLoadingScreen />;

  return (
    <main className={`app-shell ${chatOpen ? 'chat-open' : 'chat-closed'}`}>
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={15} /></div><span>Morrow</span></div>
        <div className="sidebar-actions"><button className="new-note" onClick={createNote}><Plus size={16} /> New note</button><button className="icon-button" aria-label="Search"><Search size={17} /></button></div><label className="import-vault-button"><Upload size={14} /> Import vault<input type="file" hidden multiple {...{ webkitdirectory: '', directory: '' }} onChange={selectVault} /></label>
        <nav className="nav-list"><button className={`nav-item ${noteView === 'all' ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setNoteView('all'); }}><FileText size={16} /> All notes <span>{notes.filter((note) => !note.deleted_at && !note.is_archived).length}</span></button><button className={`nav-item ${noteView === 'favorites' ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setNoteView('favorites'); }}><Star size={16} /> Favorites <span>{notes.filter((note) => !note.deleted_at && note.is_favorite && !note.is_archived).length}</span></button><button className={`nav-item ${noteView === 'archive' ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setNoteView('archive'); }}><Archive size={16} /> Archive <span>{notes.filter((note) => !note.deleted_at && note.is_archived).length}</span></button><button className={`nav-item ${noteView === 'trash' ? 'selected' : ''}`} onClick={() => { setSelectedFolder(null); setNoteView('trash'); }}><Trash2 size={16} /> Trash <span>{notes.filter((note) => note.deleted_at).length}</span></button></nav>
        <div className="section-heading"><span>Folders</span><button aria-label="Add folder" onClick={() => void createFolder()} disabled={folderSaving}><FolderPlus size={15} /></button></div>
        <div className="folder-list">{folders.map((folder) => <div className={`folder-row ${selectedFolder === folder.id ? 'selected' : ''}`} key={folder.id}><button className="folder-toggle" onClick={() => { setSelectedFolder(folder.id); setNoteView('folder'); setOpenFolders((current) => ({ ...current, [folder.id]: !current[folder.id] })); }} aria-label={`Toggle ${folder.name}`}><span className="folder-icon">{openFolders[folder.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Folder size={15} /></span>{renamingFolderId === folder.id ? <input className="folder-rename-input" aria-label={`Rename ${folder.name}`} autoFocus value={folderRenameInput} maxLength={120} onChange={(event) => setFolderRenameInput(event.target.value)} onClick={(event) => event.stopPropagation()} onDoubleClick={(event) => event.stopPropagation()} onBlur={() => void renameFolder(folder)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void renameFolder(folder); } if (event.key === 'Escape') { setRenamingFolderId(null); } }} /> : <span onDoubleClick={(event) => { event.stopPropagation(); setRenamingFolderId(folder.id); setFolderRenameInput(folder.name); }}>{folder.name}</span>}</button><span className="muted-count">{notes.filter((note) => note.folder_id === folder.id && !note.deleted_at).length}</span><button className="folder-delete" aria-label={`Delete ${folder.name}`} onClick={() => deleteFolder(folder)}><Trash2 size={13} /></button></div>)}</div>
        <div className="sidebar-footer"><div className="avatar">{(user?.user_metadata?.display_name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}</div><div className="profile"><strong>{user?.user_metadata?.display_name ?? user?.email}</strong><small>Personal workspace</small></div><Link className="icon-button" href="/settings" aria-label="Open settings"><Settings size={16} /></Link><SignOutButton /></div>
      </aside>
      <section className="notes-panel"><div className="panel-header"><div><p className="eyebrow">Personal workspace</p><h2>{noteView === 'trash' ? 'Trash' : noteView === 'archive' ? 'Archive' : noteView === 'favorites' ? 'Favorites' : selectedFolder ? folderName(selectedFolder) : 'All notes'}</h2></div><div className="panel-header-actions"><button className="icon-button" aria-label={notesMenuOpen ? 'Close notes actions' : 'Open notes actions'} onClick={() => setNotesMenuOpen((current) => !current)}><MoreHorizontal size={18} /></button>{notesMenuOpen && <div className="notes-panel-menu" role="menu" aria-label="Notes actions"><button type="button" role="menuitem" aria-label={selectingNotes ? 'Cancel selection' : 'Select notes'} onClick={toggleSelectNotes}>{selectingNotes ? 'Cancel selection' : 'Select notes'}</button></div>}</div></div><div className="note-search"><Search size={15} /><input placeholder="Filter notes" value={filter} onChange={(event) => setFilter(event.target.value)} /></div>{error && <p className="workspace-error" role="alert">{error}</p>}{noteView !== 'trash' && selectingNotes && selectedNoteIds.size > 0 && <div className="bulk-toolbar"><span>{selectedNoteIds.size} selected</span><button onClick={() => void bulkMoveToTrash()}><Trash2 size={14} /> Move to Trash</button><button aria-label="Clear selection" onClick={() => setSelectedNoteIds(new Set())}><X size={14} /></button></div>}{loading ? <p className="workspace-message">Loading your notes…</p> : <div className="note-list">{visibleNotes.map((note) => <div className={`note-card ${note.id === selectedNote ? 'active' : ''} ${selectingNotes ? 'selection-enabled' : ''}`} key={note.id}>{selectingNotes && <label className="note-select"><input type="checkbox" checked={selectedNoteIds.has(note.id)} onChange={(event) => { setSelectedNoteIds((current) => { const next = new Set(current); if (event.target.checked) next.add(note.id); else next.delete(note.id); return next; }); }} aria-label={`Select ${note.title}`} /><span><Check size={12} /></span></label>}<button className="note-card-content" onClick={() => setSelectedNote(note.id)} onContextMenu={(event) => openNoteMenu(event, note)}><div className="note-card-icon"><FileText size={16} /></div><div><strong>{note.title}</strong><small>{folderName(note.folder_id)} · {note.deleted_at ? `Deleted ${new Date(note.deleted_at).toLocaleDateString()}` : new Date(note.updated_at).toLocaleDateString()}</small></div></button></div>)}{visibleNotes.length === 0 && <p className="workspace-message">No notes here yet.</p>}</div>}{noteView !== 'trash' && <button className="add-note" onClick={createNote}><Plus size={16} /> Add a note</button>}{contextMenu && <NoteContextMenu menu={contextMenu} folders={folders} onRename={() => { setSelectedNote(contextMenu.note.id); setContextMenu(null); requestAnimationFrame(() => document.querySelector<HTMLInputElement>('.title-input')?.focus()); }} onArchive={() => void archiveNote(contextMenu.note)} onDelete={() => void moveToTrash(contextMenu.note)} onRestore={() => void restoreNote(contextMenu.note)} onPermanentDelete={() => void permanentlyDeleteNote(contextMenu.note)} onMove={(folderId) => void moveNote(contextMenu.note, folderId)} onClose={() => setContextMenu(null)} />}</section>
      <section className="editor"><header className="editor-header"><div className="breadcrumbs"><span>{folderName(selected?.folder_id ?? null)}</span><span>/</span><span>{selected?.title ?? 'No note selected'}</span></div><div className="editor-tools"><span className="save-status"><span className={saveStatus === 'error' ? 'save-error-dot' : saveStatus === 'saving' ? 'saving-dot' : 'saved-dot'} /> {saveStatus === 'error' ? 'Save failed' : saveStatus === 'saving' ? 'Saving…' : 'Saved'}</span><div className="view-toggle" role="group" aria-label="Editor view"><button type="button" className={!rawMarkdown ? 'selected' : ''} aria-pressed={!rawMarkdown} onClick={() => setRawMarkdown(false)} disabled={!selected}><PenLine size={14} /> Editor</button><button type="button" className={rawMarkdown ? 'selected' : ''} aria-pressed={rawMarkdown} onClick={() => setRawMarkdown(true)} disabled={!selected}><Code2 size={14} /> Raw</button></div><button className="icon-button" disabled={!selected} onClick={() => selected && deleteNote(selected)} aria-label="Delete note"><Trash2 size={16} /></button><button className={`icon-button ${selected?.is_favorite ? 'favorite-active' : ''}`} type="button" disabled={!selected} aria-label={selected?.is_favorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={selected?.is_favorite ?? false} onClick={() => selected && void toggleFavorite(selected)}><Star size={17} /></button><button className="icon-button" onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle AI chat"><PanelRight size={17} /></button></div></header><div className="editor-content">{selected ? <><RecoveryNotice note={selected} onRecover={(draft) => { setNotes((current) => current.map((item) => item.id === selected.id ? { ...item, ...draft } : item)); autosaveRef.current?.schedule(selected.id, draft, selected.version); setSaveStatus('saving'); }} /><input className="title-input" value={selected.title} onChange={(event) => updateNote(selected.id, { title: event.target.value })} aria-label="Note title" />{rawMarkdown ? <RawMarkdownEditor value={selected.content_markdown} onChange={(content_markdown) => updateNote(selected.id, { content_markdown })} /> : <MarkdownEditor value={selected.content_markdown} onChange={(content_markdown) => updateNote(selected.id, { content_markdown })} onUploadImage={uploadImage} proposal={pendingProposal?.noteId === selected.id ? pendingProposal : null} onAcceptProposal={acceptProposal} onDiscardProposal={() => setPendingProposal(null)} />}</> : <div className="workspace-message" aria-label="Markdown note content">Create a note to start writing.</div>}</div></section>
      {vaultPreview && <VaultPreview preview={vaultPreview} imported={vaultImported} progress={vaultProgress} busy={importingVault} onClose={() => { setVaultPreview(null); if (vaultImported) { setVaultImported(false); router.refresh(); } }} onImport={() => void importVault()} />}<div className="agent-resize-handle" role="separator" tabIndex={0} aria-label="Resize or toggle AI agent" onClick={() => setChatOpen((current) => !current)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setChatOpen((current) => !current); } }} onMouseDown={(event) => { const startX = event.clientX; const startWidth = Number.parseInt(localStorage.getItem('morrow-agent-width') ?? '315', 10); const move = (moveEvent: MouseEvent) => { const width = Math.min(520, Math.max(260, startWidth - (moveEvent.clientX - startX))); document.documentElement.style.setProperty('--agent-width', `${width}px`); localStorage.setItem('morrow-agent-width', String(width)); }; const stop = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', stop); }; window.addEventListener('mousemove', move); window.addEventListener('mouseup', stop); }}><Sparkles size={14} /></div>{chatOpen && <AgentPanel activeNote={selected} onProposal={(proposal) => { if (!pendingProposal) setPendingProposal(proposal); }} onClose={() => setChatOpen(false)} />}
    </main>
  );
}

function RawMarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  return <textarea ref={textareaRef} className="raw-markdown-editor" value={value} onChange={(event) => onChange(event.target.value)} aria-label="Raw Markdown note content" spellCheck={false} />;
}

function RecoveryNotice({ note, onRecover }: { note: NoteRow; onRecover: (draft: NoteDraft) => void }) {
  const recovery = readRecoveryCopy(note.id);
  if (!recovery || (recovery.title === note.title && recovery.content_markdown === note.content_markdown)) return null;
  return <div className="workspace-error" role="status">A local recovery copy is available. <button type="button" onClick={() => { onRecover(recovery); removeRecoveryCopy(note.id); }}>Restore draft</button></div>;
}

function NoteContextMenu({ menu, folders, onRename, onArchive, onDelete, onRestore, onPermanentDelete, onMove, onClose }: { menu: { note: NoteRow; x: number; y: number }; folders: FolderRow[]; onRename: () => void; onArchive: () => void; onDelete: () => void; onRestore: () => void; onPermanentDelete: () => void; onMove: (folderId: string | null) => void; onClose: () => void }) {
  return <><div className="context-menu-dismiss" onClick={onClose} aria-hidden="true" /><div className="note-context-menu" style={{ left: menu.x, top: menu.y }} role="menu" aria-label={`Actions for ${menu.note.title}`}>{menu.note.deleted_at ? <><button role="menuitem" onClick={onRestore}><Undo2 size={14} /> Restore</button><button className="danger-action" role="menuitem" onClick={onPermanentDelete}><Trash2 size={14} /> Delete permanently</button></> : <><button role="menuitem" onClick={onRename}><Pencil size={14} /> Rename</button><label className="move-note-item"><Folder size={14} /> Move to <select aria-label={`Move ${menu.note.title} to`} value={menu.note.folder_id ?? ''} onChange={(event) => onMove(event.target.value || null)}><option value="">Unfiled</option>{folders.map((folder) => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label><button role="menuitem" onClick={onArchive}>{menu.note.is_archived ? <ArchiveRestore size={14} /> : <Archive size={14} />} {menu.note.is_archived ? 'Unarchive' : 'Archive'}</button><button className="danger-action" role="menuitem" onClick={onDelete}><Trash2 size={14} /> Move to Trash</button></>}</div></>;
}

function VaultPreview({ preview, imported, progress, busy, onClose, onImport }: { preview: { notes: VaultNote[]; images: VaultImage[]; ignored: string[] }; imported: boolean; progress: { completed: number; total: number; current: string } | null; busy: boolean; onClose: () => void; onImport: () => void }) {
  const percentage = progress && progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
  if (imported) return <div className="vault-backdrop" role="dialog" aria-modal="true" aria-labelledby="vault-preview-title"><section className="vault-card vault-card-success"><header className="vault-header"><div><p className="eyebrow">Import complete</p><h2 id="vault-preview-title">Vault imported</h2><p>Your notes and images are ready in your workspace.</p></div><button className="icon-button" onClick={onClose} aria-label="Close import confirmation"><X size={18} /></button></header><footer className="vault-actions"><button className="auth-submit" onClick={onClose}>Close</button></footer></section></div>;
  return <div className="vault-backdrop" role="dialog" aria-modal="true" aria-labelledby="vault-preview-title"><section className={`vault-card ${busy ? 'vault-card-busy' : ''}`}><header className="vault-header"><div><p className="eyebrow">Import preview</p><h2 id="vault-preview-title">Review vault import</h2><p>{preview.notes.length} notes · {preview.images.length} images{preview.ignored.length ? ` · ${preview.ignored.length} ignored` : ''}</p></div><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Close import preview"><X size={18} /></button></header>{busy && progress && <div className="vault-progress" role="status" aria-live="polite"><div className="vault-progress-heading"><span><span className="vault-spinner" aria-hidden="true" /> Uploading your vault…</span><strong>{progress.completed} / {progress.total}</strong></div><div className="vault-progress-track"><div className="vault-progress-bar" style={{ width: `${percentage}%` }} /></div><small>Currently processing {progress.current}</small></div>}<div className="vault-summary"><div><FileText size={15} /><strong>Notes</strong><span>{preview.notes.length} Markdown files</span></div><div><ImagePlus size={15} /><strong>Images</strong><span>{preview.images.length} image files uploaded to cloud storage</span></div></div><div className="vault-file-list"><h3>{busy ? 'Importing files' : 'Files to import'}</h3>{[...preview.notes.map((note) => `/${note.path} · note`), ...preview.images.map((image) => `/${image.path} · image`)].slice(0, 100).map((path) => <code key={path}>{path}</code>)}{preview.notes.length + preview.images.length > 100 && <small>Showing the first 100 files.</small>}</div>{preview.ignored.length > 0 && <p className="vault-ignored">Other file types will be ignored ({preview.ignored.length}).</p>}<footer className="vault-actions"><button onClick={onClose} disabled={busy}>Cancel</button><button className="auth-submit" onClick={onImport} disabled={busy || preview.notes.length === 0}>{busy ? 'Uploading…' : 'Import vault'}</button></footer></section></div>;
}
