import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const usersHandlers = [
  http.patch(`${BASE_URL}/users/:id`, () => {
    return HttpResponse.json({ data: { id: '2', isActive: true } });
  }),

  http.post(`${BASE_URL}/users/:id/deactivate`, () => {
    return HttpResponse.json({ data: { id: '2', isActive: false } });
  }),

  http.delete(`${BASE_URL}/users/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
];
