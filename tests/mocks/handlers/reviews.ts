import { http, HttpResponse } from 'msw';

const BASE_URL = 'http://localhost:3000/api/v1';

export const reviewsHandlers = [
  http.get(`${BASE_URL}/reviews/admin`, () => {
    return HttpResponse.json({
      data: [],
      meta: { total: 7, page: 1, limit: 1, totalPages: 7 },
    });
  }),
];
