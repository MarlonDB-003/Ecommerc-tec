import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import FreteEntrega from './FreteEntrega';

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

describe('FreteEntrega page', () => {
  it('renders Header', () => {
    render(<FreteEntrega />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    render(<FreteEntrega />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders shipping info content', () => {
    render(<FreteEntrega />);
    const text = document.body.textContent ?? '';
    expect(text.toLowerCase()).toMatch(/frete|entrega|prazo|envio/i);
  });
});
