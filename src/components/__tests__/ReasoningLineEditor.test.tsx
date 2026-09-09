import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReasoningLineEditor } from '../ReasoningLineEditor';
import type { ReasoningLineStage } from '../../types';

// @vitest-environment jsdom

describe('ReasoningLineEditor', () => {
  const mockOnChange = vi.fn();
  
  const stages: ReasoningLineStage[] = [
    { id: '1', title: 'Stage 1', isCompleted: false },
    { id: '2', title: 'Stage 2', isCompleted: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders empty state when not editing and no stages', () => {
    render(<ReasoningLineEditor stages={[]} isEditing={false} onChange={mockOnChange} />);
    expect(screen.getByText('Nenhum estágio nesta linha de raciocínio.')).toBeDefined();
  });

  it('renders stages correctly when not editing', () => {
    render(<ReasoningLineEditor stages={stages} isEditing={false} onChange={mockOnChange} />);
    expect(screen.getByText('Stage 1')).toBeDefined();
    expect(screen.getByText('Stage 2')).toBeDefined();
    expect(screen.queryByPlaceholderText('Nome do novo estágio...')).toBeNull();
  });

  it('renders input for new stage when editing', () => {
    render(<ReasoningLineEditor stages={stages} isEditing={true} onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText('Nome do novo estágio...')).toBeDefined();
  });

  it('allows adding a new stage when editing', async () => {
    const user = userEvent.setup();
    render(<ReasoningLineEditor stages={stages} isEditing={true} onChange={mockOnChange} />);
    
    const input = screen.getByPlaceholderText('Nome do novo estágio...');
    await user.type(input, 'New Stage{enter}');
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const newStages = mockOnChange.mock.calls[0][0];
    expect(newStages).toHaveLength(3);
    expect(newStages[2].title).toBe('New Stage');
    expect(newStages[2].isCompleted).toBe(false);
  });

  it('allows toggling stage completion when not editing', async () => {
    const user = userEvent.setup();
    render(<ReasoningLineEditor stages={stages} isEditing={false} onChange={mockOnChange} />);
    
    const toggleBtn = screen.getByLabelText('Alternar conclusão do estágio Stage 1');
    await user.click(toggleBtn);
    
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const newStages = mockOnChange.mock.calls[0][0];
    expect(newStages[0].isCompleted).toBe(true);
  });

  it('allows updating stage title when editing', async () => {
    render(<ReasoningLineEditor stages={stages} isEditing={true} onChange={mockOnChange} />);
    
    const textareas = screen.getAllByDisplayValue(/Stage/);
    fireEvent.change(textareas[0], { target: { value: 'Stage 1 Edited' } });
    
    expect(mockOnChange).toHaveBeenCalled();
    const newStages = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(newStages[0].title).toBe('Stage 1 Edited');
  });

  it('allows deleting a stage when editing', async () => {
    const user = userEvent.setup();
    render(<ReasoningLineEditor stages={stages} isEditing={true} onChange={mockOnChange} />);
    
    const deleteBtn = screen.getByLabelText('Deletar estágio Stage 1');
    await user.click(deleteBtn);
    
    expect(mockOnChange).toHaveBeenCalled();
    const newStages = mockOnChange.mock.calls[0][0];
    expect(newStages).toHaveLength(1);
    expect(newStages[0].title).toBe('Stage 2');
  });
});
