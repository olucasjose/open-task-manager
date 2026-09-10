import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../useTheme';

describe('useTheme', () => {
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    localStorageMock = {};
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageMock[key] || null,
        setItem: (key: string, val: string) => { localStorageMock[key] = val; },
      },
      writable: true
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((_query) => ({
        matches: false,
      })),
    });
    
    document.documentElement.classList.remove('dark');
  });

  it('loads theme from matchMedia if no localstorage', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('loads theme from localstorage if available', () => {
    localStorageMock['theme'] = 'dark';
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme and updates localstorage/dom', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });
    
    expect(result.current.isDarkMode).toBe(true);
    expect(localStorageMock['theme']).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
