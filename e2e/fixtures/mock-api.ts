import type { Page } from '@playwright/test';

// Mock admin user profile
export const MOCK_ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@example.com',
  firstName: 'Admin',
  lastName: 'User',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

// Mock tokens
const MOCK_ACCESS_TOKEN = 'mock-access-token-for-e2e';
const MOCK_REFRESH_TOKEN = 'mock-refresh-token-for-e2e';

// Helper to create a standard API success response
const apiResponse = <T>(data: T) => ({
  status: 'success' as const,
  data,
});

// Paginated empty response
const emptyPaginatedResponse = () =>
  apiResponse({
    items: [],
    meta: {
      totalItems: 0,
      itemCount: 0,
      itemsPerPage: 10,
      totalPages: 0,
      currentPage: 1,
    },
  });

// Sets up route interception for auth endpoints (login, refresh, profile, logout)
export const mockAuthApi = async (page: Page): Promise<void> => {
  // POST /auth/login — returns tokens or 401
  await page.route(`**/auth/login`, async (route) => {
    const request = route.request();
    if (request.method() !== 'POST') return route.fallback();

    const body = request.postDataJSON();

    if (body.email !== MOCK_ADMIN_USER.email || body.password !== 'Admin123!') {
      return route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 401,
          message: 'Invalid email or password. Please try again.',
        }),
      });
    }

    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        apiResponse({
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        }),
      ),
    });
  });

  // POST /auth/refresh — returns new tokens
  await page.route(`**/auth/refresh`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(
        apiResponse({
          accessToken: MOCK_ACCESS_TOKEN,
          refreshToken: MOCK_REFRESH_TOKEN,
        }),
      ),
    });
  });

  // GET /users/me — returns admin user
  await page.route(`**/users/me`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiResponse(MOCK_ADMIN_USER)),
    });
  });

  // POST /auth/logout — success
  await page.route(`**/auth/logout`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiResponse(null)),
    });
  });
};

// Sets up route interception for dashboard endpoints
export const mockDashboardApi = async (page: Page): Promise<void> => {
  // GET /orders
  await page.route(`**/orders?**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPaginatedResponse()),
    });
  });

  // GET /inventory/low-stock
  await page.route(`**/inventory/low-stock**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPaginatedResponse()),
    });
  });

  // GET /reviews/admin
  await page.route(`**/reviews/admin**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPaginatedResponse()),
    });
  });

  // GET /notifications/unread-count
  await page.route(`**/notifications/unread-count`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(apiResponse({ count: 0 })),
    });
  });

  // GET /notifications/admin
  await page.route(`**/notifications/admin**`, async (route) => {
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(emptyPaginatedResponse()),
    });
  });
};
