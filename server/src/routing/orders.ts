import { Router } from 'express';
import {
  CreateOrderRequest,
  HOUSE_DISCOUNT_RATE,
  MenuItem,
  OrderAvailabilityChange,
  OrderLine,
} from '@common';
import { menuItems, orders } from '@data';

const router = Router();

const isCreateOrderRequest = (value: unknown): value is CreateOrderRequest => {
  if (!value || typeof value !== 'object') return false;

  const request = value as Partial<CreateOrderRequest>;

  return (
    typeof request.idempotencyKey === 'string' &&
    request.idempotencyKey.length > 0 &&
    Array.isArray(request.items) &&
    request.items.every(
      (item) =>
        !!item &&
        typeof item === 'object' &&
        typeof item.itemId === 'string' &&
        Number.isFinite(item.quantity) &&
        Number.isFinite(item.price),
    )
  );
};

const getAvailabilityChange = (
  menuItem: MenuItem,
  requestedPrice: number,
): string | null => {
  if (!menuItem.enabled) return 'This item is no longer available.';

  if (menuItem.userPrice && requestedPrice < menuItem.price)
    return `The minimum price is now $${menuItem.price.toFixed(2)}.`;

  if (!menuItem.userPrice && requestedPrice !== menuItem.price)
    return `The price is now $${menuItem.price.toFixed(2)}.`;

  return null;
};

router.get('/orders', (_req, res) => {
  res.json([...orders].reverse());
});

router.post('/orders', (req, res) => {
  if (!isCreateOrderRequest(req.body))
    return res.status(400).json({ error: 'A valid order is required.' });

  const existingOrder = orders.find(
    (order) => order.idempotencyKey === req.body.idempotencyKey,
  );

  if (existingOrder) return res.json(existingOrder);

  const changes: OrderAvailabilityChange[] = [];
  const orderItems: OrderLine[] = [];

  for (const requestedItem of req.body.items) {
    const menuItem = menuItems.find((item) => item.id === requestedItem.itemId);

    if (!menuItem) {
      changes.push({
        itemId: requestedItem.itemId,
        reason: 'The item is no longer on the menu.',
      });

      continue;
    }

    const reason = getAvailabilityChange(menuItem, requestedItem.price);
    if (reason) {
      changes.push({ itemId: menuItem.id, reason });

      continue;
    }

    if (
      !Number.isInteger(requestedItem.quantity) ||
      requestedItem.quantity < 1
    ) {
      return res
        .status(400)
        .json({ error: `Quantity for ${menuItem.name} must be at least one.` });
    }

    orderItems.push({
      itemId: menuItem.id,
      name: menuItem.name,
      quantity: requestedItem.quantity,
      price: requestedItem.price,
    });
  }

  if (changes.length > 0)
    return res.status(409).json({
      error:
        'Some items changed before checkout. Review your order and try again.',
      changes,
    });

  if (orderItems.length === 0)
    return res
      .status(400)
      .json({ error: 'Your order has no available items.' });

  const subtotal = orderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const discount = subtotal * HOUSE_DISCOUNT_RATE;
  const order = {
    id: `order-${Date.now()}-${orders.length + 1}`,
    idempotencyKey: req.body.idempotencyKey,
    items: orderItems,
    subtotal,
    discount,
    total: subtotal - discount,
    createdAt: new Date().toISOString(),
  };

  orders.push(order);
  req.app.locals.io?.emit('orders-changed');

  res.status(201).json(order);
});

export default router;
