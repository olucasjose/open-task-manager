import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { ENTRY_STRATEGIES } from '../EntryRegistry';
import userEvent from '@testing-library/user-event';

// @vitest-environment jsdom

describe('EntryRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('has required strategies', () => {
    expect(ENTRY_STRATEGIES.note).toBeDefined();
    expect(ENTRY_STRATEGIES.task).toBeDefined();
    expect(ENTRY_STRATEGIES.reasoningLine).toBeDefined();
  });

  it('note strategy renders editor with title and content fields', async () => {
    const user = userEvent.setup();
    const setTitle = vi.fn();
    const setContent = vi.fn();
    
    render(
      <div>
        {ENTRY_STRATEGIES.note.renderEditor({
          title: 'Note Title',
          setTitle,
          content: 'Note Content',
          setContent,
          metadata: null,
          setMetadata: vi.fn(),
          isNew: false
        })}
      </div>
    );
    
    const titleInput = screen.getByDisplayValue('Note Title');
    const contentInput = screen.getByDisplayValue('Note Content');
    
    expect(titleInput).toBeDefined();
    expect(contentInput).toBeDefined();
    
    await user.type(titleInput, 'a');
    expect(setTitle).toHaveBeenCalled();
  });

  it('reasoningLine strategy renders ReasoningLineEditor', () => {
    render(
      <div>
        {ENTRY_STRATEGIES.reasoningLine.renderEditor({
          title: 'RL Title',
          setTitle: vi.fn(),
          content: '',
          setContent: vi.fn(),
          metadata: { stages: [{ id: '1', title: 'S1', isCompleted: false }] },
          setMetadata: vi.fn(),
          isNew: false
        })}
      </div>
    );
    
    expect(screen.getByDisplayValue('RL Title')).toBeDefined();
    expect(screen.getByDisplayValue('S1')).toBeDefined();
  });

  it('task strategy renderListIcon renders checkbox and handles click', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    
    render(
      <div>
        {ENTRY_STRATEGIES.task.renderListIcon(
          { isCompleted: false },
          { onClick }
        )}
      </div>
    );
    
    const checkboxBtn = screen.getByRole('button');
    await user.click(checkboxBtn);
    
    expect(onClick).toHaveBeenCalled();
  });
});
