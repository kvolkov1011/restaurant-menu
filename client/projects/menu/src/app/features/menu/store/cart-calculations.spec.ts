import { describe, expect, it } from 'vitest';
import { MenuItem } from '@common';
import { calculateCartSummary, resolveCartItems } from './cart-calculations';

const item = (overrides: Partial<MenuItem> = {}): MenuItem => ({
  id: 'coffee',
  categoryId: 'beverages',
  name: 'Coffee',
  price: 3.5,
  enabled: true,
  ...overrides,
});

describe('cart calculations', () => {
  it('uses the current item and preserves a user price when its mode is unchanged', () => {
    const result = resolveCartItems(
      [{ itemId: 'coffee', item: item(), quantity: 2, price: 5, userPrice: true }],
      [item({ price: 4, userPrice: true, description: 'Updated coffee' })],
    );

    expect(result).toEqual([
      {
        item: item({ price: 4, userPrice: true, description: 'Updated coffee' }),
        quantity: 2,
        price: 5,
      },
    ]);
  });

  it('resets the price when customer-set pricing changes mode', () => {
    const result = resolveCartItems(
      [{ itemId: 'coffee', item: item(), quantity: 1, price: 8, userPrice: false }],
      [item({ price: 4, userPrice: true })],
    );

    expect(result[0]?.price).toBe(4);
  });

  it('keeps removed items visible but excludes them from the summary', () => {
    const result = resolveCartItems(
      [{ itemId: 'coffee', item: item(), quantity: 2, price: 3.5, userPrice: false }],
      [],
    );

    expect(result[0]?.item.enabled).toBe(false);
    expect(calculateCartSummary(result)).toEqual({
      count: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
    });
  });

  it('calculates quantity, house discount, and total from available items only', () => {
    const summary = calculateCartSummary([
      { item: item(), quantity: 2, price: 5 },
      { item: item({ id: 'cake', price: 7, enabled: false }), quantity: 3, price: 7 },
    ]);

    expect(summary).toEqual({ count: 2, subtotal: 10, discount: 1, total: 9 });
  });
});
