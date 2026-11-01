import { Router } from 'express';
import { categories } from '@data';

const router = Router();

router.get('/categories', (req, res) => {
  res.json(categories);
});

router.post('/category', (req, res) => {
  const { id, name } = req.body;

  categories.push({ id, name });

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

  res.json({ id, name });
});

router.delete('/category/:id', (req, res) => {
  const { id } = req.params;

  const categoryIndex = categories.findIndex((cat) => cat.id === id);

  if (categoryIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  categories.splice(categoryIndex, 1);

  res.status(204).send();
});

export default router;
