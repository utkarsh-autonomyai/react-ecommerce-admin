import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const productsHandlers = [
  http.patch(`${BASE_URL}/products/:id`, () => {
    return HttpResponse.json({ data: { id: '1', isActive: false } });
  }),

  http.delete(`${BASE_URL}/products/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
