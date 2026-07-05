import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Contato from './Contato';

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

describe('Contato page', () => {
  it('renders Header', () => {
    render(<Contato />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    render(<Contato />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders contact page content', () => {
    render(<Contato />);
    const text = document.body.textContent ?? '';
    expect(text.toLowerCase()).toMatch(/contato|mensagem|email|telefone/i);
  });
});
