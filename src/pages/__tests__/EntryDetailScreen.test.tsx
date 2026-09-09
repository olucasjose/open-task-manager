import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EntryDetailScreen } from '../EntryDetailScreen';
import { MemoryRouter } from 'react-router-dom';

// @vitest-environment jsdom

const { mockUpdateEntry, mockRemoveEntry, mockMoveToTrash } = vi.hoisted(() => ({
  mockUpdateEntry: vi.fn(),
  mockRemoveEntry: vi.fn(),
  mockMoveToTrash: vi.fn().mockResolvedValue({ id: '1', title: 'Old Title', type: 'note', content: 'Old content', trashedAt: 123 }),
}));

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      entries: [
        { id: '1', title: 'Old Title', type: 'note', content: 'Old content' }
      ],
      isLoaded: true,
      settings: {},
      addEntry: vi.fn(),
      updateEntry: mockUpdateEntry,
      removeEntry: mockRemoveEntry,
    };
    return selector(state);
  })
}));

vi.mock('../../hooks/useServices', () => ({
  useServices: () => ({
    entryService: {
      updateEntry: vi.fn(),
      deleteEntry: vi.fn(),
      moveToTrash: mockMoveToTrash,
    }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: '1' }),
    useSearchParams: () => [new URLSearchParams()],
  };
});

describe('EntryDetailScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders the preview initially', () => {
    render(
      <MemoryRouter>
        <EntryDetailScreen />
      </MemoryRouter>
    );
    
    const titles = screen.getAllByText('Old Title');
    expect(titles.length).toBeGreaterThan(0);
    const contents = screen.getAllByText('Old content');
    expect(contents.length).toBeGreaterThan(0);
  });

  it('enters edit mode and handles delete', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <EntryDetailScreen />
      </MemoryRouter>
    );
    
    const deleteBtn = screen.getByLabelText('Deletar');
    await user.click(deleteBtn);
    
    expect(window.confirm).toHaveBeenCalled();
    // Verify services and store were updated, and navigated away
    expect(mockMoveToTrash).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', title: 'Old Title' })
    );
    expect(mockUpdateEntry).toHaveBeenCalledWith(
      expect.objectContaining({ id: '1', trashedAt: 123 })
    );
    expect(mockNavigate).toHaveBeenCalled();
  });
});
