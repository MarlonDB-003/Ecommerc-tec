import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
  afterEach(() => {
    Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 0 });
  });

  it('does not render button initially (not scrolled)', () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole('button', { name: /voltar ao topo/i })).not.toBeInTheDocument();
  });

  it('shows button after scrolling past 300px', () => {
    render(<ScrollToTop />);
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: /voltar ao topo/i })).toBeInTheDocument();
  });

  it('hides button when scrolled back to top', () => {
    render(<ScrollToTop />);
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    expect(screen.getByRole('button', { name: /voltar ao topo/i })).toBeInTheDocument();

    act(() => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 0 });
      fireEvent.scroll(window);
    });
    expect(screen.queryByRole('button', { name: /voltar ao topo/i })).not.toBeInTheDocument();
  });

  it('calls window.scrollTo when button is clicked', () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;
    render(<ScrollToTop />);
    act(() => {
      Object.defineProperty(window, 'pageYOffset', { writable: true, configurable: true, value: 400 });
      fireEvent.scroll(window);
    });
    fireEvent.click(screen.getByRole('button', { name: /voltar ao topo/i }));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
