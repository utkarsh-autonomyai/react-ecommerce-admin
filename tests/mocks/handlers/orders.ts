import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const ordersHandlers = [
  http.get(`${BASE_URL}/orders`, ({ request }) => {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') ?? '10';

    const orders = [
      {
        id: '1',
        orderNumber: 'ORD-001',
        status: 'PENDING',
        total: '149.99',
        subtotal: '139.99',
        shippingCost: '10.00',
        createdAt: '2026-03-15T10:00:00Z',
      },
      {
        id: '2',
        orderNumber: 'ORD-002',
        status: 'DELIVERED',
        total: '299.99',
        subtotal: '289.99',
        shippingCost: '10.00',
        createdAt: '2026-03-14T10:00:00Z',
      },
      {
        id: '3',
        orderNumber: 'ORD-003',
        status: 'SHIPPED',
        total: '59.99',
        subtotal: '49.99',
        shippingCost: '10.00',
        createdAt: '2026-03-13T10:00:00Z',
      },
    ].slice(0, Number(limit));

    return HttpResponse.json({
      data: orders,
      meta: { total: 3, page: 1, limit: Number(limit), totalPages: 1 },
    });
  }),
];
