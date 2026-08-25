'use client';

import { useEffect, useState } from 'react';
import { Archive, ChevronDown, ChevronRight, FileText, Folder, FolderPlus, MoreHorizontal, PanelRight, Plus, Search, Sparkles, Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { SignOutButton } from './auth/auth-form';

export default function Home() {
  const [user, setUser] = useState<{ email?: string; user_metadata?: { display_name?: string } } | null>(null);
  const [folders, setFolders] = useState<{ id: string; name: string; count: number; open: boolean }[]>([]);
  const [notes, setNotes] = useState<{ id: string; title: string; folder: string; content_markdown: string; active?: boolean }[]>([]);
  useEffect(() => {
    let supabase;
    try { supabase = createClient(); } catch { return; }
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user);
      if (!data.user) return;
      const [{ data: folderRows }, { data: noteRows }] = await Promise.all([
        supabase.from('folders').select('id, name').order('position'),
        supabase.from('notes').select('id, title, content_markdown, folder_id').order('updated_at', { ascending: false }),
      ]);
      const folderNames = new Map((folderRows ?? []).map((folder) => [folder.id, folder.name]));
      setFolders((folderRows ?? []).map((folder) => ({ ...folder, count: (noteRows ?? []).filter((note) => note.folder_id === folder.id).length, open: true })));
      setNotes((noteRows ?? []).map((note) => ({ ...note, folder: note.folder_id ? folderNames.get(note.folder_id) ?? 'Unknown folder' : 'Unfiled' })));
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => listener.subscription.unsubscribe();
  }, []);
  const [chatOpen, setChatOpen] = useState(true);
  const [content, setContent] = useState(`Morrow is a quiet place for your ideas.\n\nStart writing here, or create a new note from the sidebar. Everything is saved automatically as you work.\n\n## A little inspiration\n\n> The best thinking happens when you give it room to wander.\n\nTry using **Markdown** to add structure to your thoughts.`);

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Sparkles size={15} /></div><span>Morrow</span></div>
        <div className="sidebar-actions"><button className="new-note"><Plus size={16} /> New note</button><button className="icon-button" aria-label="Search"><Search size={17} /></button></div>
        <nav className="nav-list"><button className="nav-item selected"><FileText size={16} /> All notes <span>25</span></button><button className="nav-item"><Star size={16} /> Favorites</button><button className="nav-item"><Archive size={16} /> Archive</button></nav>
        <div className="section-heading"><span>Folders</span><button aria-label="Add folder"><FolderPlus size={15} /></button></div>
        <div className="folder-list">{folders.map((folder) => <div className="folder-row" key={folder.name}><button className="folder-toggle" aria-label={`Toggle ${folder.name}`}>{folder.open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}<Folder size={15} /> <span>{folder.name}</span></button><span className="muted-count">{folder.count}</span></div>)}</div>
        <div className="sidebar-footer"><div className="avatar">{(user?.user_metadata?.display_name ?? user?.email ?? 'U').slice(0, 2).toUpperCase()}</div><div className="profile"><strong>{user?.user_metadata?.display_name ?? user?.email}</strong><small>Personal workspace</small></div><SignOutButton /></div>
      </aside>
      <section className="notes-panel"><div className="panel-header"><div><p className="eyebrow">Personal workspace</p><h2>All notes</h2></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><div className="note-search"><Search size={15} /><input placeholder="Filter notes" /></div><div className="note-list">{notes.map((note) => <button className={`note-card ${note.active ? 'active' : ''}`} key={note.title}><div className="note-card-icon"><FileText size={16} /></div><div><strong>{note.title}</strong><small>{note.folder} · Just now</small></div></button>)}</div><button className="add-note"><Plus size={16} /> Add a note</button></section>
      <section className="editor"><header className="editor-header"><div className="breadcrumbs"><span>{notes[0]?.folder ?? 'Unfiled'}</span><span>/</span><span>{notes[0]?.title ?? 'No note selected'}</span></div><div className="editor-tools"><span className="save-status"><span className="saved-dot" /> Saved</span><button className="icon-button"><Star size={17} /></button><button className="icon-button" onClick={() => setChatOpen(!chatOpen)} aria-label="Toggle AI chat"><PanelRight size={17} /></button></div></header><div className="editor-content"><input className="title-input" defaultValue={notes[0]?.title ?? ''} aria-label="Note title" /><div className="formatting"><button><strong>B</strong></button><button><em>I</em></button><button><s>S</s></button><span /><button>H1</button><button>☷</button><button>❝</button><button>&lt;/&gt;</button><button>↗</button></div><textarea value={notes[0] ? (content || notes[0].content_markdown) : content} onChange={(event) => setContent(event.target.value)} aria-label="Markdown note content" /></div></section>
      {chatOpen && <aside className="chat-panel"><header className="chat-header"><div><p className="eyebrow">Morrow AI</p><h2>Ask about this note</h2></div><button className="icon-button" onClick={() => setChatOpen(false)} aria-label="Close AI chat"><PanelRight size={17} /></button></header><div className="chat-body"><div className="assistant-badge"><Sparkles size={16} /></div><h3>What would you like to explore?</h3><p>I can help you develop ideas, summarize this note, or find connections in your thinking.</p><div className="suggestions"><button>Summarize this note</button><button>Help me expand this idea</button></div></div><div className="chat-input"><input placeholder="Ask anything..." /><button aria-label="Send message"><ChevronRight size={18} /></button></div><p className="chat-hint">AI can make mistakes. Check important details.</p></aside>}
    </main>
  );
}
