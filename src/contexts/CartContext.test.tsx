import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const PRODUCT_A = { id: '1', name: 'Product A', price: 100, image: 'a.jpg' };
const PRODUCT_B = { id: '2', name: 'Product B', price: 200, image: 'b.jpg' };

describe('CartContext', () => {
  describe('initial state', () => {
    it('starts with an empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.items).toHaveLength(0);
    });

    it('getTotalItems returns 0 on empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.getTotalItems()).toBe(0);
    });

    it('getTotalPrice returns 0 on empty cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      expect(result.current.getTotalPrice()).toBe(0);
    });
  });

  describe('addToCart', () => {
    it('adds a new product with quantity 1', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addToCart(PRODUCT_A); });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0]).toMatchObject({ ...PRODUCT_A, quantity: 1 });
    });

    it('increments quantity when adding same product twice', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.addToCart(PRODUCT_A);
      });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].quantity).toBe(2);
    });

    it('adds different products as separate entries', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.addToCart(PRODUCT_B);
      });
      expect(result.current.items).toHaveLength(2);
    });

    it('preserves originalPrice when provided', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => { result.current.addToCart({ ...PRODUCT_A, originalPrice: 150 }); });
      expect(result.current.items[0].originalPrice).toBe(150);
    });
  });

  describe('removeFromCart', () => {
    it('removes the correct item by id', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.addToCart(PRODUCT_B);
        result.current.removeFromCart('1');
      });
      expect(result.current.items).toHaveLength(1);
      expect(result.current.items[0].id).toBe('2');
    });

    it('does nothing when id does not exist', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.removeFromCart('nonexistent');
      });
      expect(result.current.items).toHaveLength(1);
    });
  });

  describe('updateQuantity', () => {
    it('updates the quantity of an existing item', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.updateQuantity('1', 5);
      });
      expect(result.current.items[0].quantity).toBe(5);
    });

    it('removes item when quantity is set to 0', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.updateQuantity('1', 0);
      });
      expect(result.current.items).toHaveLength(0);
    });

    it('removes item when quantity is negative', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.updateQuantity('1', -3);
      });
      expect(result.current.items).toHaveLength(0);
    });

    it('does not affect other items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.addToCart(PRODUCT_B);
        result.current.updateQuantity('1', 10);
      });
      expect(result.current.items.find(i => i.id === '2')?.quantity).toBe(1);
    });
  });

  describe('clearCart', () => {
    it('empties the cart', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A);
        result.current.addToCart(PRODUCT_B);
        result.current.clearCart();
      });
      expect(result.current.items).toHaveLength(0);
    });
  });

  describe('getTotalItems', () => {
    it('sums all quantities', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A); // qty 1
        result.current.addToCart(PRODUCT_A); // qty 2
        result.current.addToCart(PRODUCT_B); // qty 1
      });
      expect(result.current.getTotalItems()).toBe(3);
    });
  });

  describe('getTotalPrice', () => {
    it('calculates price * quantity for all items', () => {
      const { result } = renderHook(() => useCart(), { wrapper });
      act(() => {
        result.current.addToCart(PRODUCT_A); // 100 * 1
        result.current.addToCart(PRODUCT_A); // 100 * 2
        result.current.addToCart(PRODUCT_B); // 200 * 1
      });
      // 100*2 + 200*1 = 400
      expect(result.current.getTotalPrice()).toBe(400);
    });
  });

  describe('useCart guard', () => {
    it('throws when used outside CartProvider', () => {
      expect(() => renderHook(() => useCart())).toThrow(
        'useCart must be used within a CartProvider'
      );
    });
  });
});
