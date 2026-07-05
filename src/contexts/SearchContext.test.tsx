import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { SearchProvider, useSearch } from './SearchContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SearchProvider>{children}</SearchProvider>
);

describe('SearchContext', () => {
  it('starts with empty search query', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    expect(result.current.searchQuery).toBe('');
  });

  it('updates searchQuery when setSearchQuery is called', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setSearchQuery('notebook'); });
    expect(result.current.searchQuery).toBe('notebook');
  });

  it('can clear the query by setting empty string', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setSearchQuery('notebook'); });
    act(() => { result.current.setSearchQuery(''); });
    expect(result.current.searchQuery).toBe('');
  });

  it('handles special characters in query', () => {
    const { result } = renderHook(() => useSearch(), { wrapper });
    act(() => { result.current.setSearchQuery('RTX 4090 & CPU'); });
    expect(result.current.searchQuery).toBe('RTX 4090 & CPU');
  });

  it('throws when used outside SearchProvider', () => {
    expect(() => renderHook(() => useSearch())).toThrow(
      'useSearch must be used within a SearchProvider'
    );
  });
});
