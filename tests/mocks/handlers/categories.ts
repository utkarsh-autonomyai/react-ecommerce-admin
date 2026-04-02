import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const categoriesHandlers = [
  http.patch(`${BASE_URL}/categories/:id`, () => {
    return HttpResponse.json({ data: { id: '1', isActive: false } });
  }),

  http.delete(`${BASE_URL}/categories/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
