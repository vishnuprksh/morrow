import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

const mockNotes = vi.hoisted(() => ({
  rows: [
    { id: 'note-1', title: 'My note', folder_id: null, content_markdown: '', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null },
    { id: 'note-2', title: 'Project ideas', folder_id: null, content_markdown: 'Roadmap planning', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null },
  ],
  defaultNote: { id: 'default-note', title: 'Morrow — an AI first Note Application', folder_id: null, content_markdown: '', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null },
  insert: vi.fn(),
}));

vi.mock('./editor/markdown-editor', () => ({
  MarkdownEditor: () => <div aria-label="Markdown note content" />,
}));

const chainSelect = (data: unknown) => ({
  select: vi.fn().mockReturnValue({
    order: vi.fn().mockResolvedValue({ data, error: null }),
    single: vi.fn().mockResolvedValue({ data, error: null }),
  }),
  update: vi.fn().mockReturnValue({
    eq: vi.fn().mockResolvedValue({ error: null }),
  }),
});

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1', email: 'user@example.com' } }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    from: (table: string) => {
      if (table === 'folders') return chainSelect([]);
      if (table === 'notes') return {
        ...chainSelect(mockNotes.rows),
        insert: mockNotes.insert.mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockNotes.defaultNote, error: null }),
          }),
        }),
      };
      return {
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: [], error: null }),
        }),
        update: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
        insert: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: null, error: null }) }),
        delete: vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) }),
      };
    },
    storage: { from: vi.fn() },
  }),
}));

describe('workspace shell', () => {
  it('creates and selects the default note for a new workspace', async () => {
    mockNotes.rows = [];

    render(<Home />);

    expect(await screen.findByRole('button', { name: /Morrow — an AI first Note Application/i })).toBeInTheDocument();
    expect(mockNotes.insert).toHaveBeenCalledWith({
      user_id: 'user-1',
      title: 'Morrow — an AI first Note Application',
      content_markdown: '',
    });
    expect(screen.getByDisplayValue('Morrow — an AI first Note Application')).toBeInTheDocument();

    mockNotes.rows = [
      { id: 'note-1', title: 'My note', folder_id: null, content_markdown: '', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null },
      { id: 'note-2', title: 'Project ideas', folder_id: null, content_markdown: 'Roadmap planning', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null },
    ];
    mockNotes.insert.mockReset();
  });

  it('shows a loading screen while authentication is checked', () => {
    render(<Home />);
    expect(screen.getByText('Morrow')).toBeInTheDocument();
    expect(screen.getByText('Preparing your workspace…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('toggles the favorite button state when the selected note is favorited', async () => {
    render(<Home />);

    const button = await screen.findByRole('button', { name: 'Add to favorites' });
    expect(button).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Remove from favorites' })).toHaveAttribute('aria-pressed', 'true');
    });
  });

  it('only reveals note selection controls after choosing select notes from the notes panel menu', async () => {
    render(<Home />);

    await screen.findByRole('button', { name: /My note/i });
    expect(screen.queryByRole('checkbox', { name: 'Select My note' })).not.toBeInTheDocument();

    fireEvent.click(await screen.findByRole('button', { name: 'Open notes actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Select notes' }));

    await waitFor(() => {
      expect(screen.getByRole('checkbox', { name: 'Select My note' })).toBeVisible();
    });
  });

  it('selects and clears all visible notes from the bulk toolbar', async () => {
    render(<Home />);

    await screen.findByRole('button', { name: /My note/i });
    fireEvent.click(await screen.findByRole('button', { name: 'Open notes actions' }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Select notes' }));

    fireEvent.click(await screen.findByRole('button', { name: 'Select all notes' }));
    expect(screen.getByRole('checkbox', { name: 'Select My note' })).toBeChecked();
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Move selected notes to Trash' })).toHaveAttribute('title', 'Move selected notes to Trash');

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(screen.getByRole('checkbox', { name: 'Select My note' })).not.toBeChecked();
  });

  it('searches note titles and content from the global search button', async () => {
    render(<Home />);

    fireEvent.click(await screen.findByRole('button', { name: 'Search all notes' }));
    const searchInput = screen.getByRole('textbox', { name: 'Search titles and note content' });
    fireEvent.change(searchInput, { target: { value: 'roadmap' } });

    expect(screen.getByRole('option', { name: /Project ideasRoadmap planning/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /My note/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('option', { name: /Project ideasRoadmap planning/i }));
    expect(screen.getByDisplayValue('Project ideas')).toBeInTheDocument();
  });

  it('focuses global and note-list search with their keyboard shortcuts', async () => {
    render(<Home />);
    await screen.findByRole('button', { name: /My note/i });

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    expect(screen.getByRole('dialog', { name: 'Search all notes' })).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'f', ctrlKey: true, shiftKey: true });
    expect(screen.getByPlaceholderText('Filter notes')).toHaveFocus();
  });
});
