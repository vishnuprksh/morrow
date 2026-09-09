import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Home from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
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
      if (table === 'notes') return chainSelect([{ id: 'note-1', title: 'My note', folder_id: null, content_markdown: '', version: 1, updated_at: new Date().toISOString(), is_favorite: false, is_archived: false, deleted_at: null }]);
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
});
