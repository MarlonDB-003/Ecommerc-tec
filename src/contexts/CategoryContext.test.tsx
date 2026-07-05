import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { CategoryProvider, useCategory } from './CategoryContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CategoryProvider>{children}</CategoryProvider>
);

describe('CategoryContext', () => {
  it('starts with "todos" as default category', () => {
    const { result } = renderHook(() => useCategory(), { wrapper });
    expect(result.current.selectedCategory).toBe('todos');
  });

  it('updates selectedCategory when setSelectedCategory is called', () => {
    const { result } = renderHook(() => useCategory(), { wrapper });
    act(() => { result.current.setSelectedCategory('gaming'); });
    expect(result.current.selectedCategory).toBe('gaming');
  });

  it('can switch between all valid categories', () => {
    const { result } = renderHook(() => useCategory(), { wrapper });
    const categories = ['smartphones', 'gaming', 'consoles', 'componentes', 'todos'] as const;
    for (const cat of categories) {
      act(() => { result.current.setSelectedCategory(cat); });
      expect(result.current.selectedCategory).toBe(cat);
    }
  });

  it('throws when used outside CategoryProvider', () => {
    expect(() => renderHook(() => useCategory())).toThrow(
      'useCategory must be used within a CategoryProvider'
    );
  });
});
