import type { Page } from '@playwright/test';

const API_BASE = 'http://localhost:3000';

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
// Backend wraps all responses as { success, data, timestamp }
const apiResponse = <T>(data: T) => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

// Paginated empty response — backend shape: { success, data: T[], meta, timestamp }
const emptyPaginatedResponse = () => ({
  success: true,
  data: [] as unknown[],
  meta: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  timestamp: new Date().toISOString(),
});

const jsonResponse = (data: unknown, status = 200) => ({
  status,
  contentType: 'application/json',
  body: JSON.stringify(data),
});

// Single catch-all that intercepts ALL API requests and routes by path
export const mockAllApis = async (page: Page): Promise<void> => {
  await page.route(`${API_BASE}/**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();

    // --- Auth endpoints ---

    if (path === '/auth/login' && method === 'POST') {
      const body = request.postDataJSON();
      if (
        body.email !== MOCK_ADMIN_USER.email ||
        body.password !== 'Admin123!'
      ) {
        return route.fulfill(
          jsonResponse(
            {
              statusCode: 401,
              message: 'Invalid email or password. Please try again.',
            },
            401,
          ),
        );
      }
      return route.fulfill(
        jsonResponse(
          apiResponse({
            accessToken: MOCK_ACCESS_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
          }),
        ),
      );
    }

    if (path === '/auth/refresh' && method === 'POST') {
      return route.fulfill(
        jsonResponse(
          apiResponse({
            accessToken: MOCK_ACCESS_TOKEN,
            refreshToken: MOCK_REFRESH_TOKEN,
          }),
        ),
      );
    }

    if (path === '/auth/logout' && method === 'POST') {
      return route.fulfill(jsonResponse(apiResponse(null)));
    }

    // --- User profile ---

    if (path === '/users/me' && method === 'GET') {
      return route.fulfill(jsonResponse(apiResponse(MOCK_ADMIN_USER)));
    }

    // --- Notification count (non-paginated) ---

    if (path === '/notifications/unread-count' && method === 'GET') {
      return route.fulfill(jsonResponse(apiResponse({ count: 0 })));
    }

    // --- All other GET requests: return empty paginated response ---

    if (method === 'GET') {
      return route.fulfill(jsonResponse(emptyPaginatedResponse()));
    }

    // Non-GET requests we don't handle — let them fail naturally
    return route.abort('connectionrefused');
  });
};

// --- Mock order data for order status workflow tests ---

const MOCK_ORDER_LIST_ITEM = {
  id: 'order-001',
  orderNumber: 'ORD-20250601-001',
  status: 'PENDING' as const,
  subtotal: '199.99',
  discountAmount: '0.00',
  couponCode: null,
  shippingCost: '9.99',
  tax: '41.99',
  total: '251.97',
  createdAt: '2025-06-01T12:00:00.000Z',
  updatedAt: '2025-06-01T12:00:00.000Z',
};

const MOCK_ORDER_DETAIL = {
  ...MOCK_ORDER_LIST_ITEM,
  userId: 'user-001',
  shippingFullName: 'John Doe',
  shippingPhone: '+48 123 456 789',
  shippingStreet: '123 Main Street',
  shippingCity: 'Warsaw',
  shippingRegion: 'Mazovia',
  shippingPostalCode: '00-001',
  shippingCountry: 'Poland',
  shippingMethodName: 'Standard Shipping',
  notes: null,
  adminNotes: null,
  items: [
    {
      id: 'item-001',
      productName: 'Wireless Headphones',
      productSlug: 'wireless-headphones',
      sku: 'WH-001',
      unitPrice: '199.99',
      quantity: 1,
      lineTotal: '199.99',
      productImage: null,
    },
  ],
};

export const MOCK_ORDERS = [MOCK_ORDER_LIST_ITEM];

// Adds order-specific route overrides
export const mockOrdersApi = async (page: Page): Promise<void> => {
  await mockAllApis(page);

  // GET /orders — return mock orders list
  await page.route(`${API_BASE}/orders?**`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();

    return route.fulfill(
      jsonResponse({
        success: true,
        data: MOCK_ORDERS,
        meta: { total: MOCK_ORDERS.length, page: 1, limit: 10, totalPages: 1 },
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // GET /orders/:id — return mock order detail
  await page.route(`${API_BASE}/orders/*`, async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') return route.fallback();

    // Don't intercept /orders?query — only /orders/{id}
    const url = new URL(request.url());
    if (url.search) return route.fallback();

    return route.fulfill(jsonResponse(apiResponse(MOCK_ORDER_DETAIL)));
  });

  // PATCH /orders/:id/status — return updated order
  await page.route(`${API_BASE}/orders/*/status`, async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();

    const body = route.request().postDataJSON();

    return route.fulfill(
      jsonResponse(
        apiResponse({
          ...MOCK_ORDER_DETAIL,
          status: body.status,
          adminNotes: body.adminNotes ?? null,
          updatedAt: new Date().toISOString(),
        }),
      ),
    );
  });
};

// --- Mock review data for review moderation tests ---

const MOCK_PENDING_REVIEW = {
  id: 'review-001',
  rating: 4,
  title: 'Great product',
  comment: 'Really enjoyed using this product, highly recommend!',
  status: 'PENDING' as const,
  adminNote: null,
  createdAt: '2025-06-01T10:00:00.000Z',
  updatedAt: '2025-06-01T10:00:00.000Z',
  user: { id: 'user-001', firstName: 'John', lastName: 'Doe' },
  product: {
    id: 'product-001',
    name: 'Wireless Headphones',
    slug: 'wireless-headphones',
  },
};

const MOCK_APPROVED_REVIEW = {
  id: 'review-002',
  rating: 5,
  title: 'Amazing quality',
  comment: 'Best purchase this year!',
  status: 'APPROVED' as const,
  adminNote: 'Looks genuine',
  createdAt: '2025-05-15T08:00:00.000Z',
  updatedAt: '2025-05-16T09:00:00.000Z',
  user: { id: 'user-002', firstName: 'Jane', lastName: 'Smith' },
  product: { id: 'product-002', name: 'USB-C Cable', slug: 'usb-c-cable' },
};

export const MOCK_REVIEWS = [MOCK_PENDING_REVIEW, MOCK_APPROVED_REVIEW];

// Adds review-specific route overrides on top of mockAllApis
export const mockReviewsApi = async (page: Page): Promise<void> => {
  await mockAllApis(page);

  // Override: GET /reviews/admin — return mock reviews
  await page.route(`${API_BASE}/reviews/admin*`, async (route) => {
    if (route.request().method() !== 'GET') return route.fallback();

    return route.fulfill(
      jsonResponse({
        success: true,
        data: MOCK_REVIEWS,
        meta: { total: MOCK_REVIEWS.length, page: 1, limit: 10, totalPages: 1 },
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // PATCH /reviews/:id/moderate — return updated review
  await page.route(`${API_BASE}/reviews/*/moderate`, async (route) => {
    if (route.request().method() !== 'PATCH') return route.fallback();

    const body = route.request().postDataJSON();
    const url = new URL(route.request().url());
    const reviewId = url.pathname.split('/')[2];
    const review =
      MOCK_REVIEWS.find((r) => r.id === reviewId) ?? MOCK_PENDING_REVIEW;

    return route.fulfill(
      jsonResponse(
        apiResponse({
          ...review,
          status: body.status,
          adminNote: body.adminNote ?? null,
          updatedAt: new Date().toISOString(),
        }),
      ),
    );
  });
};
