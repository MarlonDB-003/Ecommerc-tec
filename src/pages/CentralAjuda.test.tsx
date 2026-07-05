import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CentralAjuda from './CentralAjuda';

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

describe('CentralAjuda page', () => {
  it('renders Header', () => {
    render(<CentralAjuda />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    render(<CentralAjuda />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders "Central de Ajuda" heading', () => {
    render(<CentralAjuda />);
    expect(screen.getByText('Central de Ajuda')).toBeInTheDocument();
  });

  it('renders FAQ or help content', () => {
    render(<CentralAjuda />);
    const text = document.body.textContent ?? '';
    expect(text.length).toBeGreaterThan(50);
  });
});
