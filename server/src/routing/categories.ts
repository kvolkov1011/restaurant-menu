import { Request, Router } from 'express';
import { categories, menuItems } from '@data';
import { CategorySummary } from '@common';
import { validateCategory } from '../validation';

const router = Router();

const notifyMenuChanged = (req: Request): void => {
  req.app.locals.io?.emit('menu-changed');
};

router.get('/categories', (req, res) => {
  const itemCounts = new Map<string, number>();

  for (const menuItem of menuItems) {
    itemCounts.set(menuItem.categoryId, (itemCounts.get(menuItem.categoryId) ?? 0) + 1);
  }

  const categorySummaries: CategorySummary[] = categories.map((category) => ({
    ...category,
    itemCount: itemCounts.get(category.id) ?? 0,
  }));

  res.json(categorySummaries);
});

router.post('/category', (req, res) => {
  const result = validateCategory(req.body);
  if ('error' in result) return res.status(400).json(result);

  if (categories.some((category) => category.id === result.value.id)) {
    return res.status(409).json({ error: 'A category with this ID already exists.' });
  }

  categories.push(result.value);
  notifyMenuChanged(req);

  res.status(201).json(result.value);
});

router.put('/category/:id', (req, res) => {
  const { id } = req.params;
  const categoryIndex = categories.findIndex((cat) => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const result = validateCategory({ ...req.body, id });
  if ('error' in result) return res.status(400).json(result);

  categories[categoryIndex] = result.value;
  notifyMenuChanged(req);

  res.json(result.value);
});

router.delete('/category/:id', (req, res) => {
  const { id } = req.params;

  const categoryIndex = categories.findIndex((cat) => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  if (menuItems.some((item) => item.categoryId === id)) {
    return res.status(409).json({ error: 'Cannot delete a category that has menu items.' });
  }

  categories.splice(categoryIndex, 1);
  notifyMenuChanged(req);

  res.status(204).send();
});

export default router;
