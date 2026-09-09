import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrashScreen } from '../TrashScreen';
import { MemoryRouter } from 'react-router-dom';

// @vitest-environment jsdom

const { mockUpdateEntry, mockRemoveEntry, mockRestoreEntry, mockDeleteEntry, mockEmptyTrash } = vi.hoisted(() => ({
  mockUpdateEntry: vi.fn(),
  mockRemoveEntry: vi.fn(),
  mockRestoreEntry: vi.fn().mockResolvedValue({ id: '1', title: 'Trashed Item', trashedAt: undefined, isTrashed: false, type: 'note' }),
  mockDeleteEntry: vi.fn(),
  mockEmptyTrash: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      entries: [
        { id: '1', title: 'Trashed Item', trashedAt: Date.now(), type: 'note' }
      ],
      isLoaded: true,
      settings: {},
      updateEntry: mockUpdateEntry,
      removeEntry: mockRemoveEntry,
    };
    return selector(state);
  })
}));

vi.mock('../../hooks/useServices', () => ({
  useServices: () => ({
    entryService: {
      restoreEntry: mockRestoreEntry,
      deleteEntry: mockDeleteEntry,
      emptyTrash: mockEmptyTrash,
    }
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useOutletContext: () => ({ openDrawer: vi.fn() }),
  };
});

describe('TrashScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders trashed items', () => {
    render(
      <MemoryRouter>
        <TrashScreen />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Trashed Item')).toBeDefined();
    expect(screen.getByText('Esvaziar')).toBeDefined();
  });

  it('handles empty trash', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TrashScreen />
      </MemoryRouter>
    );
    
    const emptyBtn = screen.getByText('Esvaziar');
    await user.click(emptyBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    // A função do hook deve ter processado a confirmação e chamado emptyTrash
    expect(mockEmptyTrash).toHaveBeenCalled();
  });

  it('handles restore item', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <TrashScreen />
      </MemoryRouter>
    );
    
    const restoreBtn = screen.getByTitle('Restaurar');
    await user.click(restoreBtn);
    
    expect(mockRestoreEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'Trashed Item' })
    );
    // Também precisa refletir a mudança no store (a prop isTrashed agora é undefined/false)
    expect(mockUpdateEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', isTrashed: false, trashedAt: undefined })
    );
  });
});
