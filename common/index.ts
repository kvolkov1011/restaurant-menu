export const HOUSE_DISCOUNT_RATE = 0.1;

export type Category = {
  id: string;
  name: string;
};

export type CategorySummary = Category & {
  itemCount: number;
};

export type MenuItem = {
  id: string;
  categoryId: Category['id'];
  name: string;
  description?: string;
  price: number;
  userPrice?: boolean;
  enabled: boolean;
};

export type OrderLineRequest = {
  itemId: MenuItem['id'];
  quantity: number;
  price: number;
};

export type OrderLine = OrderLineRequest & { name: string };

export type CreateOrderRequest = {
  idempotencyKey: string;
  items: OrderLineRequest[];
};

export type Order = {
  id: string;
  idempotencyKey: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
};

export type OrderAvailabilityChange = {
  itemId: MenuItem['id'];
  reason: string;
};
