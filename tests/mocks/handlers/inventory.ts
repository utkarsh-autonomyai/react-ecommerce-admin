import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const inventoryHandlers = [
  http.get(`${BASE_URL}/inventory/low-stock`, () => {
    return HttpResponse.json({
      data: [
        {
          id: '1',
          name: 'Widget A',
          sku: 'WGT-001',
          availableStock: 3,
          lowStockThreshold: 10,
        },
        {
          id: '2',
          name: 'Gadget B',
          sku: 'GDG-002',
          availableStock: 1,
          lowStockThreshold: 5,
        },
      ],
      meta: { total: 2, page: 1, limit: 5, totalPages: 1 },
    });
  }),
];
