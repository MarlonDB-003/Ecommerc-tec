import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import ThemeToggle from './ThemeToggle';

const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: mockSetTheme }),
}));

describe('ThemeToggle', () => {
  it('renders a button', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible label "Alternar tema"', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    expect(screen.getByText('Alternar tema')).toBeInTheDocument();
  });

  it('calls setTheme with "dark" when current theme is light', async () => {
    await act(async () => {
      render(<ThemeToggle />);
    });
    fireEvent.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });
});
