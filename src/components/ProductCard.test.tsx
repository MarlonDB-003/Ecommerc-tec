import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

// Mock dependencies
const mockAddToCart = vi.fn();
vi.mock('@/contexts/CartContext', () => ({
  useCart: () => ({ addToCart: mockAddToCart }),
}));

const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

const BASE_PROPS = {
  id: 'prod-1',
  name: 'Notebook Gamer X',
  price: 5999.99,
  image: '/img/notebook.jpg',
  rating: 4,
  reviews: 128,
};

describe('ProductCard', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('default (full) mode', () => {
    it('renders the product name', () => {
      render(<ProductCard {...BASE_PROPS} />);
      expect(screen.getByText('Notebook Gamer X')).toBeInTheDocument();
    });

    it('renders the formatted price', () => {
      render(<ProductCard {...BASE_PROPS} />);
      expect(screen.getByText('R$ 5999.99')).toBeInTheDocument();
    });

    it('renders the original price when provided', () => {
      render(<ProductCard {...BASE_PROPS} originalPrice={7000} />);
      expect(screen.getByText('R$ 7000.00')).toBeInTheDocument();
    });

    it('does not render original price when not provided', () => {
      render(<ProductCard {...BASE_PROPS} />);
      expect(screen.queryByText(/7000/)).not.toBeInTheDocument();
    });

    it('shows OFERTA badge when isOnSale is true', () => {
      render(<ProductCard {...BASE_PROPS} isOnSale />);
      expect(screen.getByText('OFERTA')).toBeInTheDocument();
    });

    it('does not show OFERTA badge when isOnSale is false', () => {
      render(<ProductCard {...BASE_PROPS} isOnSale={false} />);
      expect(screen.queryByText('OFERTA')).not.toBeInTheDocument();
    });

    it('renders the product image with correct src and alt', () => {
      render(<ProductCard {...BASE_PROPS} />);
      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/img/notebook.jpg');
      expect(img).toHaveAttribute('alt', 'Notebook Gamer X');
    });

    it('calls onClick when the card is clicked', () => {
      const onClick = vi.fn();
      render(<ProductCard {...BASE_PROPS} onClick={onClick} />);
      fireEvent.click(screen.getByRole('img').closest('div')!.parentElement!);
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('calls addToCart with correct data when add button is clicked', () => {
      render(<ProductCard {...BASE_PROPS} originalPrice={7000} />);
      const btn = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(btn);
      expect(mockAddToCart).toHaveBeenCalledWith({
        id: 'prod-1',
        name: 'Notebook Gamer X',
        price: 5999.99,
        originalPrice: 7000,
        image: '/img/notebook.jpg',
      });
    });

    it('shows toast after adding to cart', () => {
      render(<ProductCard {...BASE_PROPS} />);
      const btn = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(btn);
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Produto adicionado!' })
      );
    });

    it('stops event propagation when add button is clicked (does not trigger card onClick)', () => {
      const onClick = vi.fn();
      render(<ProductCard {...BASE_PROPS} onClick={onClick} />);
      const btn = screen.getByRole('button', { name: /adicionar/i });
      fireEvent.click(btn);
      expect(onClick).not.toHaveBeenCalled();
    });

    it('does not render star rating section (full mode has no stars)', () => {
      render(<ProductCard {...BASE_PROPS} />);
      // Non-compact mode doesn't show star ratings
      expect(screen.queryByText('(128)')).not.toBeInTheDocument();
    });
  });

  describe('compact mode', () => {
    it('renders product name', () => {
      render(<ProductCard {...BASE_PROPS} compact />);
      expect(screen.getByText('Notebook Gamer X')).toBeInTheDocument();
    });

    it('renders price', () => {
      render(<ProductCard {...BASE_PROPS} compact />);
      expect(screen.getByText('R$ 5999.99')).toBeInTheDocument();
    });

    it('shows crossed-out original price above current price', () => {
      render(<ProductCard {...BASE_PROPS} compact originalPrice={8000} />);
      expect(screen.getByText('R$ 8000.00')).toBeInTheDocument();
      expect(screen.getByText('R$ 8000.00')).toHaveClass('line-through');
    });

    it('shows OFERTA badge when isOnSale', () => {
      render(<ProductCard {...BASE_PROPS} compact isOnSale />);
      expect(screen.getByText('OFERTA')).toBeInTheDocument();
    });

    it('calls addToCart when button is clicked', () => {
      render(<ProductCard {...BASE_PROPS} compact />);
      const btn = screen.getByRole('button', { name: /adicionar ao carrinho/i });
      fireEvent.click(btn);
      expect(mockAddToCart).toHaveBeenCalled();
    });

    it('calls onClick when the compact card is clicked', () => {
      const onClick = vi.fn();
      render(<ProductCard {...BASE_PROPS} compact onClick={onClick} />);
      fireEvent.click(screen.getByText('Notebook Gamer X'));
      expect(onClick).toHaveBeenCalled();
    });

    it('renders a smaller image (h-32 class)', () => {
      render(<ProductCard {...BASE_PROPS} compact />);
      const img = screen.getByRole('img');
      expect(img).toHaveClass('h-32');
    });

    it('renders review count', () => {
      render(<ProductCard {...BASE_PROPS} compact reviews={256} />);
      expect(screen.getByText('(256)')).toBeInTheDocument();
    });

    it('renders 5 star icons', () => {
      const { container } = render(<ProductCard {...BASE_PROPS} compact rating={3} />);
      const stars = container.querySelectorAll('svg');
      expect(stars.length).toBeGreaterThanOrEqual(5);
    });
  });
});
