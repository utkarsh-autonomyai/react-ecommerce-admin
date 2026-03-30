import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../tests/mocks/server';
import { renderWithProviders } from '../../../../tests/helpers';
import { LowStockAlerts } from './low-stock-alerts';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('LowStockAlerts', () => {
  it('should show loading skeletons initially', () => {
    const { container } = renderWithProviders(<LowStockAlerts />);
    expect(screen.getByText('Low Stock Alerts')).toBeInTheDocument();
    expect(container.querySelector('[class*="animate-pulse"]')).toBeTruthy();
  });

  it('should render low stock products after loading', async () => {
    renderWithProviders(<LowStockAlerts />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });
    expect(screen.getByText('Gadget B')).toBeInTheDocument();
  });

  it('should show stock and threshold values', async () => {
    renderWithProviders(<LowStockAlerts />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should show empty state when no low stock products', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/inventory/low-stock', () => {
        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, limit: 5, totalPages: 0 },
        });
      }),
    );

    renderWithProviders(<LowStockAlerts />);

    await waitFor(() => {
      expect(
        screen.getByText('All products are well stocked.'),
      ).toBeInTheDocument();
    });
  });

  it('should have a link to inventory page', async () => {
    renderWithProviders(<LowStockAlerts />);

    await waitFor(() => {
      expect(screen.getByText('Widget A')).toBeInTheDocument();
    });

    const viewAllLink = screen.getByRole('link');
    expect(viewAllLink).toHaveAttribute('href', '/inventory');
  });
});
