import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useServices } from '../useServices';
import { DatabaseProvider } from '../../contexts/DatabaseContext';

describe('useServices', () => {
  it('returns services instances', () => {
    const mockDb: any = { init: () => {} };
    const { result } = renderHook(() => useServices(), {
      wrapper: ({ children }) => <DatabaseProvider db={mockDb}>{children}</DatabaseProvider>
    });
    
    expect(result.current.entryService).toBeDefined();
    expect(result.current.notebookService).toBeDefined();
    expect(result.current.settingsService).toBeDefined();
  });
});
