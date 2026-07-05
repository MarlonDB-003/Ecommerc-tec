import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Hero from './Hero';

const mockSetSelectedCategory = vi.fn();

vi.mock('@/contexts/CategoryContext', () => ({
  useCategory: () => ({
    selectedCategory: 'todos',
    setSelectedCategory: mockSetSelectedCategory,
  }),
}));

vi.mock('@/assets/tech-hero.jpg', () => ({ default: '/tech-hero.jpg' }));

describe('Hero', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders the main heading', () => {
    render(<Hero />);
    expect(screen.getByText('Tecnologia')).toBeInTheDocument();
  });

  it('renders the "Ver Produtos" button', () => {
    render(<Hero />);
    expect(screen.getByRole('button', { name: /ver produtos/i })).toBeInTheDocument();
  });

  it('renders the "Gaming Zone" button', () => {
    render(<Hero />);
    expect(screen.getByRole('button', { name: /gaming zone/i })).toBeInTheDocument();
  });

  it('clicking "Ver Produtos" sets category to todos', () => {
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: /ver produtos/i }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('todos');
  });

  it('clicking "Gaming Zone" sets category to gaming', () => {
    render(<Hero />);
    fireEvent.click(screen.getByRole('button', { name: /gaming zone/i }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('gaming');
  });

  it('renders stats section', () => {
    render(<Hero />);
    expect(screen.getByText('22+')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
    expect(screen.getByText('5 regiões')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Hero />);
    expect(screen.getByText(/Setup gamer/i)).toBeInTheDocument();
  });
});
