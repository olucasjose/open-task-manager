import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsScreen } from '../SettingsScreen';
import { MemoryRouter } from 'react-router-dom';

// @vitest-environment jsdom

const { mockSetSettings, mockSaveSettings } = vi.hoisted(() => ({
  mockSetSettings: vi.fn(),
  mockSaveSettings: vi.fn()
}));

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      settings: { requireDeleteConfirm: true, requireTrashConfirm: false },
      setSettings: mockSetSettings,
    };
    return selector(state);
  })
}));

vi.mock('../../hooks/useServices', () => ({
  useServices: () => ({
    settingsService: {
      saveSettings: mockSaveSettings,
    }
  })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ openDrawer: vi.fn() }),
  };
});

describe('SettingsScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders toggles', () => {
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Aparência')).toBeDefined();
    expect(screen.getByText('Confirmar exclusão de itens e cadernos')).toBeDefined();
  });
  
  it('toggles settings when clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <SettingsScreen />
      </MemoryRouter>
    );
    
    const toggle = screen.getByLabelText('Confirmar exclusão de itens e cadernos');
    await user.click(toggle);
    
    // O SettingsController pega o setting local ({ requireDeleteConfirm: true }), 
    // inverte para falso e envia.
    expect(mockSetSettings).toHaveBeenCalledWith(
      expect.objectContaining({ requireDeleteConfirm: false })
    );
    expect(mockSaveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ requireDeleteConfirm: false })
    );
  });
});
