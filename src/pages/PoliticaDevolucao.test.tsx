import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PoliticaDevolucao from './PoliticaDevolucao';

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

describe('PoliticaDevolucao page', () => {
  it('renders Header', () => {
    render(<PoliticaDevolucao />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    render(<PoliticaDevolucao />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders return policy content', () => {
    render(<PoliticaDevolucao />);
    const text = document.body.textContent ?? '';
    expect(text.toLowerCase()).toMatch(/devolução|política|reembolso|produto/i);
  });
});
