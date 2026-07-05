import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './NotFound';

vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/pagina-inexistente' }),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) =>
    <a href={to}>{children}</a>,
}));

describe('NotFound', () => {
  it('renders a 404 or not found message', () => {
    render(<NotFound />);
    const text = document.body.textContent ?? '';
    expect(text.toLowerCase()).toMatch(/404|não encontrada|not found|página/i);
  });

  it('renders a link to go back home', () => {
    render(<NotFound />);
    const homeLink = screen.queryByRole('link');
    expect(homeLink).toBeDefined();
  });
});
