import { render, screen } from '@testing-library/react';
import Home from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('./editor/markdown-editor', () => ({
  MarkdownEditor: () => <div aria-label="Markdown note content" />,
}));

describe('workspace shell', () => {
  it('renders the note workspace regions', () => {
    render(<Home />);
    expect(screen.getByText('Morrow')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown note content')).toBeInTheDocument();
    expect(screen.getByText('Chat with your agent')).toBeInTheDocument();
  });
});
