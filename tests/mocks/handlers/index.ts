import { authHandlers } from './auth';
import { categoriesHandlers } from './categories';
import { inventoryHandlers } from './inventory';
import { ordersHandlers } from './orders';
import { productsHandlers } from './products';
import { reviewsHandlers } from './reviews';
import { usersHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...categoriesHandlers,
  ...inventoryHandlers,
  ...ordersHandlers,
  ...productsHandlers,
  ...reviewsHandlers,
  ...usersHandlers,
];
