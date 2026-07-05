import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Footer from './Footer';

const mockNavigate = vi.fn();
const mockSetSelectedCategory = vi.fn();

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/contexts/CategoryContext', () => ({
  useCategory: () => ({
    selectedCategory: 'todos',
    setSelectedCategory: mockSetSelectedCategory,
  }),
}));

describe('Footer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders TechWorld brand name', () => {
    render(<Footer />);
    expect(screen.getByText('Tech')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('renders category quick links', () => {
    render(<Footer />);
    expect(screen.getByRole('button', { name: 'Smartphones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Gaming' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Consoles' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Componentes' })).toBeInTheDocument();
  });

  it('renders contact info', () => {
    render(<Footer />);
    expect(screen.getByText('contato@techworld.com')).toBeInTheDocument();
    expect(screen.getByText('Itacoatiara, AM')).toBeInTheDocument();
  });

  it('clicking Smartphones sets category and navigates', () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: 'Smartphones' }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('smartphones');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('clicking Gaming sets category and navigates', () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: 'Gaming' }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('gaming');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('clicking Consoles sets category and navigates', () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: 'Consoles' }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('consoles');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('clicking Componentes sets category and navigates', () => {
    render(<Footer />);
    fireEvent.click(screen.getByRole('button', { name: 'Componentes' }));
    expect(mockSetSelectedCategory).toHaveBeenCalledWith('componentes');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders support links', () => {
    render(<Footer />);
    expect(screen.getByText('Central de Ajuda')).toBeInTheDocument();
    expect(screen.getByText(/frete e entrega/i)).toBeInTheDocument();
    // "Contato" appears as both heading and link — use link role to disambiguate
    const contatoLinks = screen.getAllByText('Contato');
    expect(contatoLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders copyright notice', () => {
    render(<Footer />);
    expect(screen.getByText(/TechWorld/)).toBeInTheDocument();
    expect(screen.getByText(/Pagamentos seguros/)).toBeInTheDocument();
  });
});
