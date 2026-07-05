import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) throw new Error('Test error');
  return <div>Conteúdo filho</div>;
};

describe('ErrorBoundary', () => {
  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Conteúdo filho')).toBeInTheDocument();
  });

  it('renders error fallback UI when child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.queryByText('Conteúdo filho')).not.toBeInTheDocument();
    expect(screen.getByText('Algo deu errado')).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('shows reload button in error state', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByRole('button', { name: /recarregar/i })).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('shows error description text', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText(/ocorreu um erro inesperado/i)).toBeInTheDocument();
    consoleError.mockRestore();
  });

  it('calls window.location.reload when reload button is clicked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const reload = vi.fn();
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload },
    });
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    fireEvent.click(screen.getByRole('button', { name: /recarregar/i }));
    expect(reload).toHaveBeenCalledTimes(1);
    consoleError.mockRestore();
  });
});
