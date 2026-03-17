import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ConfirmDialog } from './confirm-dialog';

const defaultProps = {
  open: true,
  onOpenChange: vi.fn(),
  title: 'Delete Item',
  description: 'Are you sure you want to delete this item?',
  onConfirm: vi.fn(),
};

describe('ConfirmDialog', () => {
  it('should render title and description when open', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this item?'),
    ).toBeInTheDocument();
  });

  it('should not render content when closed', () => {
    render(<ConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Delete Item')).toBeNull();
  });

  it('should render default button labels', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  it('should render custom button labels', () => {
    render(
      <ConfirmDialog
        {...defaultProps}
        confirmLabel='Delete'
        cancelLabel='Keep'
      />,
    );
    expect(screen.getByRole('button', { name: 'Keep' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('should call onConfirm when confirm button is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} />);

    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('should call onOpenChange(false) when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<ConfirmDialog {...defaultProps} onOpenChange={onOpenChange} />);

    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('should show loading state and disable buttons when isLoading', () => {
    render(<ConfirmDialog {...defaultProps} isLoading />);
    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
