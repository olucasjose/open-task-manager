import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { DatabaseProvider, useDatabase } from '../DatabaseContext';

describe('DatabaseContext', () => {
  it('throws if used outside provider', () => {
    const consoleError = console.error;
    console.error = () => {};
    
    expect(() => renderHook(() => useDatabase())).toThrow(/DatabaseProvider/);
    
    console.error = consoleError;
  });

  it('provides db adapter', () => {
    const mockDb: any = { init: () => {} };
    const { result } = renderHook(() => useDatabase(), {
      wrapper: ({ children }) => <DatabaseProvider db={mockDb}>{children}</DatabaseProvider>
    });
    
    expect(result.current).toBe(mockDb);
  });
});
