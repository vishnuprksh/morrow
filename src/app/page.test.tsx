import { render, screen } from '@testing-library/react';
import Home from './page';

describe('workspace shell', () => {
  it('renders the note workspace regions', () => {
    render(<Home />);
    expect(screen.getByText('Morrow')).toBeInTheDocument();
    expect(screen.getByLabelText('Markdown note content')).toBeInTheDocument();
    expect(screen.getByText('Ask about this note')).toBeInTheDocument();
  });
});
