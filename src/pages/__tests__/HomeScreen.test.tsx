import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeScreen } from '../HomeScreen';
import { MemoryRouter } from 'react-router-dom';

// @vitest-environment jsdom

vi.mock('../../store/useStore', () => ({
  useStore: vi.fn((selector) => {
    const state = {
      notebooks: [{ id: 'nb1', name: 'Work Notebook', createdAt: 1, updatedAt: 1 }],
      entries: [
        { id: '1', title: 'Test Task', notebookId: 'nb1', type: 'task', isCompleted: false },
      ],
      isLoaded: true,
      updateEntry: vi.fn(),
    };
    return selector(state);
  })
}));

vi.mock('../../hooks/useServices', () => ({
  useServices: () => ({
    entryService: {
      updateEntry: vi.fn(),
    }
  })
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'nb1' }),
    useOutletContext: () => ({ openDrawer: vi.fn() }),
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders entries and notebook name', () => {
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    expect(screen.getByText('Test Task')).toBeDefined();
    expect(screen.getByText('Work Notebook')).toBeDefined();
  });

  it('navigates to entry when clicked', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    );
    
    const entryElement = screen.getByText('Test Task');
    await user.click(entryElement);
    
    expect(mockNavigate).toHaveBeenCalledWith('/entry/1');
  });
});
