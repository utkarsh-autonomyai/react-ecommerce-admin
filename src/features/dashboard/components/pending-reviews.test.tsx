import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';
import { server } from '../../../../tests/mocks/server';
import { renderWithProviders } from '../../../../tests/helpers';
import { PendingReviews } from './pending-reviews';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('PendingReviews', () => {
  it('should show loading skeleton initially', () => {
    const { container } = renderWithProviders(<PendingReviews />);
    expect(screen.getByText('Pending Reviews')).toBeInTheDocument();
    expect(container.querySelector('[class*="animate-pulse"]')).toBeTruthy();
  });

  it('should render pending review count', async () => {
    renderWithProviders(<PendingReviews />);

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });
    expect(screen.getByText('reviews awaiting moderation')).toBeInTheDocument();
  });

  it('should use singular form for count of 1', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/reviews/admin', () => {
        return HttpResponse.json({
          data: [],
          meta: { total: 1, page: 1, limit: 1, totalPages: 1 },
        });
      }),
    );

    renderWithProviders(<PendingReviews />);

    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
    expect(screen.getByText('review awaiting moderation')).toBeInTheDocument();
  });

  it('should show zero count', async () => {
    server.use(
      http.get('http://localhost:3000/api/v1/reviews/admin', () => {
        return HttpResponse.json({
          data: [],
          meta: { total: 0, page: 1, limit: 1, totalPages: 0 },
        });
      }),
    );

    renderWithProviders(<PendingReviews />);

    await waitFor(() => {
      expect(screen.getByText('0')).toBeInTheDocument();
    });
    expect(screen.getByText('reviews awaiting moderation')).toBeInTheDocument();
  });

  it('should have a link to reviews page', async () => {
    renderWithProviders(<PendingReviews />);

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    const viewAllLink = screen.getByRole('link');
    expect(viewAllLink).toHaveAttribute('href', '/reviews');
  });
});
