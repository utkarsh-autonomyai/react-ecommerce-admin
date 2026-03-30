import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const authHandlers = [
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
        timestamp: new Date().toISOString(),
      });
    }

    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 },
    );
  }),

  http.post(`${BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-refreshed-token',
        refreshToken: 'mock-refreshed-refresh-token',
      },
      timestamp: new Date().toISOString(),
    });
  }),

  http.post(`${BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      success: true,
      data: null,
      timestamp: new Date().toISOString(),
    });
  }),

  http.get(`${BASE_URL}/users/me`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: '1',
        email: 'admin@example.com',
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
      },
      timestamp: new Date().toISOString(),
    });
  }),
];
