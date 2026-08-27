import { render, screen } from '@testing-library/react';
import Home from './page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
}));

vi.mock('./editor/markdown-editor', () => ({
  MarkdownEditor: () => <div aria-label="Markdown note content" />,
}));

describe('workspace shell', () => {
  it('shows a loading screen while authentication is checked', () => {
    render(<Home />);
    expect(screen.getByText('Morrow')).toBeInTheDocument();
    expect(screen.getByText('Preparing your workspace…')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
