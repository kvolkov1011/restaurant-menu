import { Request, Router } from 'express';
import { categories, menuItems } from '@data';
import { validateMenuItem } from '../validation';

const router = Router();

const notifyMenuChanged = (req: Request): void => {
  req.app.locals.io?.emit('menu-changed');
};

router.get('/menu-items', (req, res) => {
  res.json(menuItems);
});

router.post('/menu-item', (req, res) => {
  const result = validateMenuItem(
    req.body,
    new Set(categories.map((category) => category.id)),
  );
  if ('error' in result) return res.status(400).json(result);

  if (menuItems.some((item) => item.id === result.value.id)) {
    return res
      .status(409)
      .json({ error: 'A menu item with this ID already exists.' });
  }

  menuItems.push(result.value);
  notifyMenuChanged(req);

  res.status(201).json(result.value);
});

router.put('/menu-item/:id', (req, res) => {
  const { id } = req.params;
  const menuItemIndex = menuItems.findIndex((item) => item.id === id);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const result = validateMenuItem(
    req.body,
    new Set(categories.map((category) => category.id)),
    id,
  );
  if ('error' in result) return res.status(400).json(result);

  menuItems[menuItemIndex] = result.value;
  notifyMenuChanged(req);

  res.json(result.value);
});

router.delete('/menu-item/:id', (req, res) => {
  const { id } = req.params;
  const menuItemIndex = menuItems.findIndex((item) => item.id === id);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  menuItems.splice(menuItemIndex, 1);
  notifyMenuChanged(req);

  res.status(204).send();
});

export default router;
