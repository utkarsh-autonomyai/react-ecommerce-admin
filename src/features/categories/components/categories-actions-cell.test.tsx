import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import {
  renderWithProviders,
  createTestQueryClient,
} from '../../../../tests/helpers';
import type { CategoryResponseDto } from '@/api/generated/types.gen';
import { CategoriesActionsCell } from './categories-actions-cell';

const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const activeCategory: CategoryResponseDto = {
  id: '1',
  name: 'Electronics',
  slug: 'electronics',
  isActive: true,
  sortOrder: 0,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const inactiveCategory: CategoryResponseDto = {
  ...activeCategory,
  id: '2',
  slug: 'inactive-cat',
  isActive: false,
};

describe('CategoriesActionsCell', () => {
  it('should render dropdown menu trigger', () => {
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);
    expect(
      screen.getByRole('button', { name: 'Open menu' }),
    ).toBeInTheDocument();
  });

  it('should show view details option', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByText('View details')).toBeInTheDocument();
  });

  it('should navigate to category detail on view details click', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByText('View details'));

    expect(mockNavigate).toHaveBeenCalledWith({
      to: '/categories/$categorySlug',
      params: { categorySlug: 'electronics' },
    });
  });

  it('should show deactivate option for active categories', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByText('Deactivate')).toBeInTheDocument();
  });

  it('should show activate option for inactive categories', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={inactiveCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));

    expect(screen.getByText('Activate')).toBeInTheDocument();
  });

  it('should show deactivate confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByText('Deactivate'));

    await waitFor(() => {
      expect(screen.getByText('Deactivate category')).toBeInTheDocument();
    });
    expect(screen.getByText(/deactivate "Electronics"/)).toBeInTheDocument();
  });

  it('should show delete confirmation dialog', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CategoriesActionsCell category={activeCategory} />);

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete category')).toBeInTheDocument();
    });
    expect(
      screen.getByText(/permanently delete "Electronics"/),
    ).toBeInTheDocument();
  });

  it('should invalidate both public and admin query keys on activate', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders(<CategoriesActionsCell category={inactiveCategory} />, {
      queryClient,
    });

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByText('Activate'));

    await waitFor(() => {
      const calledKeys = invalidateSpy.mock.calls.map(
        (call) => (call[0] as { queryKey: unknown }).queryKey,
      );
      expect(calledKeys).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'categoriesControllerFindAll' }),
        ]),
      );
      expect(calledKeys).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'categoriesControllerFindAllAdmin' }),
        ]),
      );
    });
  });

  it('should invalidate both public and admin query keys on delete', async () => {
    const user = userEvent.setup();
    const queryClient = createTestQueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    renderWithProviders(<CategoriesActionsCell category={activeCategory} />, {
      queryClient,
    });

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.getByText('Delete category')).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      const calledKeys = invalidateSpy.mock.calls.map(
        (call) => (call[0] as { queryKey: unknown }).queryKey,
      );
      expect(calledKeys).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'categoriesControllerFindAll' }),
        ]),
      );
      expect(calledKeys).toContainEqual(
        expect.arrayContaining([
          expect.objectContaining({ _id: 'categoriesControllerFindAllAdmin' }),
        ]),
      );
    });
  });
});
