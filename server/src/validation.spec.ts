import assert from 'node:assert/strict';
import test from 'node:test';
import { validateCategory, validateMenuItem } from './validation.js';

const categories = new Set(['beverages']);

test('rejects categories without a non-empty id and name', () => {
  assert.deepEqual(validateCategory({ id: '', name: 'Beverages' }), {
    error: 'Category ID is required.',
  });
  assert.deepEqual(validateCategory({ id: 'drinks' }), {
    error: 'Category name is required.',
  });
});

test('normalizes a valid category payload', () => {
  assert.deepEqual(validateCategory({ id: 'drinks', name: 'Beverages' }), {
    value: { id: 'drinks', name: 'Beverages' },
  });
});

test('rejects malformed menu item fields and unknown categories', () => {
  assert.deepEqual(
    validateMenuItem(
      {
        id: 'coffee',
        categoryId: 'unknown',
        name: 'Coffee',
        price: 3.5,
        enabled: true,
      },
      categories,
    ),
    { error: 'A valid category is required.' },
  );

  assert.deepEqual(
    validateMenuItem(
      {
        id: 'coffee',
        categoryId: 'beverages',
        name: 'Coffee',
        price: 0,
        enabled: true,
      },
      categories,
    ),
    { error: 'Menu item price must be a positive number.' },
  );
});

test('normalizes valid menu item payloads and supports path ids on update', () => {
  assert.deepEqual(
    validateMenuItem(
      {
        categoryId: 'beverages',
        name: 'Coffee',
        description: 'Freshly brewed',
        price: 3.5,
        userPrice: true,
        enabled: true,
      },
      categories,
      'coffee',
    ),
    {
      value: {
        id: 'coffee',
        categoryId: 'beverages',
        name: 'Coffee',
        description: 'Freshly brewed',
        price: 3.5,
        userPrice: true,
        enabled: true,
      },
    },
  );
});
