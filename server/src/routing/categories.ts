import { Request, Router } from 'express';
import { categories, menuItems } from '@data';
import { CategorySummary } from '@common';

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
  const { id, name } = req.body;

  categories.push({ id, name });
  notifyMenuChanged(req);

  res.status(201).json({ id, name });
});

router.put('/category/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const categoryIndex = categories.findIndex((cat) => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  categories[categoryIndex] = { id, name };
  notifyMenuChanged(req);

  res.json({ id, name });
});

router.delete('/category/:id', (req, res) => {
  const { id } = req.params;

  const categoryIndex = categories.findIndex((cat) => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  categories.splice(categoryIndex, 1);
  notifyMenuChanged(req);

  res.status(204).send();
});

export default router;
