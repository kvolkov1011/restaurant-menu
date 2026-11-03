import { HOUSE_DISCOUNT_RATE, MenuItem } from '@common';

export type CartLineSnapshot = {
  itemId: MenuItem['id'];
  item: MenuItem;
  quantity: number;
  price: number;
  userPrice: boolean;
};

export type ResolvedCartItem = {
  item: MenuItem;
  quantity: number;
  price: number;
};

export type CartSummary = {
  count: number;
  subtotal: number;
  discount: number;
  total: number;
};

export const resolveCartItems = (
  lines: readonly CartLineSnapshot[],
  currentItems: readonly MenuItem[],
): ResolvedCartItem[] => {
  const currentItemById = new Map(currentItems.map((item) => [item.id, item]));

  return lines.map((line) => {
    const item = currentItemById.get(line.itemId) ?? {
      ...line.item,
      enabled: false,
      description: 'This item is no longer available.',
    };
    const isUserPrice = item.userPrice === true;
    const modeChanged = isUserPrice !== line.userPrice;
    const price = modeChanged
      ? item.price
      : isUserPrice
        ? Math.max(line.price, item.price)
        : item.price;

    return { item, quantity: line.quantity, price };
  });
};

export const calculateCartSummary = (
  items: readonly ResolvedCartItem[],
): CartSummary => {
  const availableItems = items.filter((cartItem) => cartItem.item.enabled);
  const count = availableItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = availableItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const discount = subtotal * HOUSE_DISCOUNT_RATE;

  return { count, subtotal, discount, total: subtotal - discount };
};
