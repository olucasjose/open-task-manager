import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TopAppBar } from '../TopAppBar';

// Adicionar flag JS DOM
// @vitest-environment jsdom

describe('TopAppBar', () => {
  const mockOnBackClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the title correctly', () => {
    render(<TopAppBar title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeDefined();
  });

  it('renders rightElement if provided', () => {
    render(<TopAppBar title="Test" rightElement={<button>Right Button</button>} />);
    expect(screen.getByText('Right Button')).toBeDefined();
  });

  it('does not render back button if showBackButton is false', () => {
    render(<TopAppBar title="Test" showBackButton={false} />);
    expect(screen.queryByLabelText('Voltar')).toBeNull();
  });

  it('renders back button and calls onBackClick when clicked', async () => {
    const user = userEvent.setup();
    render(<TopAppBar title="Test" showBackButton={true} onBackClick={mockOnBackClick} />);
    
    const backBtn = screen.getByLabelText('Voltar');
    expect(backBtn).toBeDefined();
    
    await user.click(backBtn);
    expect(mockOnBackClick).toHaveBeenCalledTimes(1);
  });
});
