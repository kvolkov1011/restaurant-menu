import { Category, MenuItem } from '@common';

export type ValidationResult<T> =
  | { value: T; error?: never }
  | { value?: never; error: string };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const requiredText = (value: unknown, field: string): string | null => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return `${field} is required.`;
  }

  return null;
};

export const validateCategory = (value: unknown): ValidationResult<Category> => {
  if (!isRecord(value)) return { error: 'A category object is required.' };

  const idError = requiredText(value['id'], 'Category ID');
  if (idError) return { error: idError };

  const nameError = requiredText(value['name'], 'Category name');
  if (nameError) return { error: nameError };

  return { value: { id: value['id'] as string, name: value['name'] as string } };
};

export const validateMenuItem = (
  value: unknown,
  categoryIds: ReadonlySet<string>,
  idOverride?: string,
): ValidationResult<MenuItem> => {
  if (!isRecord(value)) return { error: 'A menu item object is required.' };

  const id = idOverride ?? value['id'];
  const idError = requiredText(id, 'Menu item ID');
  if (idError) return { error: idError };

  const categoryId = value['categoryId'];
  if (typeof categoryId !== 'string' || !categoryIds.has(categoryId)) {
    return { error: 'A valid category is required.' };
  }

  const nameError = requiredText(value['name'], 'Menu item name');
  if (nameError) return { error: nameError };

  if (value['description'] !== undefined && typeof value['description'] !== 'string') {
    return { error: 'Menu item description must be text.' };
  }

  if (typeof value['price'] !== 'number' || !Number.isFinite(value['price']) || value['price'] <= 0) {
    return { error: 'Menu item price must be a positive number.' };
  }

  if (value['userPrice'] !== undefined && typeof value['userPrice'] !== 'boolean') {
    return { error: 'Customer-set pricing must be a boolean.' };
  }

  if (typeof value['enabled'] !== 'boolean') {
    return { error: 'Menu item enabled state must be a boolean.' };
  }

  return {
    value: {
      id: id as string,
      categoryId,
      name: value['name'] as string,
      description: value['description'] as string | undefined,
      price: value['price'],
      userPrice: value['userPrice'] === true,
      enabled: value['enabled'],
    },
  };
};
