import { render, screen } from '@testing-library/react';
import SettingsPage from './page';

vi.mock('next/link', () => ({
  default: ({ children, ...props }: { children: React.ReactNode; href: string; className?: string }) => <a {...props}>{children}</a>,
}));

describe('settings page', () => {
  it('shows appearance, product, and data information', () => {
    render(<SettingsPage />);

    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'About Morrow' })).toBeInTheDocument();
    expect(screen.getByText('Version 0.1.0')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Your data' })).toBeInTheDocument();
    expect(screen.getByText(/AI credentials on the server/)).toBeInTheDocument();
  });
});