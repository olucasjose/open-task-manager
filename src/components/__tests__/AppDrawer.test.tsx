import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppDrawer } from '../AppDrawer';
import { MemoryRouter } from 'react-router-dom';

// @vitest-environment jsdom

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      notebooks: [{ id: 'nb1', name: 'Work', createdAt: 1, updatedAt: 1 }],
      entries: [],
      settings: {},
      updateNotebook: vi.fn(),
      cascadeDeleteNotebook: vi.fn(),
    };
    return selector(state);
  })
}));

vi.mock('../../hooks/useServices', () => ({
  useServices: () => ({
    notebookService: {
      createNotebook: vi.fn(),
      updateNotebook: vi.fn(),
      deleteNotebookWithCascade: vi.fn(),
    }
  })
}));

describe('AppDrawer', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders notebooks and system menu', () => {
    render(
      <MemoryRouter>
        <AppDrawer isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Todos os Itens')).toBeDefined();
    expect(screen.getByText('Work')).toBeDefined();
  });

  it('calls onClose when overlay is clicked', async () => {
    render(
      <MemoryRouter>
        <AppDrawer isOpen={true} onClose={mockOnClose} />
      </MemoryRouter>
    );
    
    const overlay = screen.getByTestId('drawer-overlay');
    mockOnClose.mockClear();
    
    fireEvent.click(overlay);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
