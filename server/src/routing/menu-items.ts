import { Router } from 'express';
import { menuItems } from '@data';

const router = Router();

router.get('/menu-items', (req, res) => {
  res.json(menuItems);
});

router.post('/menu-item', (req, res) => {
  const menuItem = req.body;

  menuItems.push(menuItem);

  res.status(201).json(menuItem);
});

router.put('/menu-item/:id', (req, res) => {
  const { id } = req.params;
  const menuItemIndex = menuItems.findIndex((item) => item.id === id);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  const menuItem = { ...req.body, id };
  menuItems[menuItemIndex] = menuItem;

  res.json(menuItem);
});

router.delete('/menu-item/:id', (req, res) => {
  const { id } = req.params;
  const menuItemIndex = menuItems.findIndex((item) => item.id === id);

  if (menuItemIndex === -1) {
    return res.status(404).json({ error: 'Menu item not found' });
  }

  menuItems.splice(menuItemIndex, 1);

  res.status(204).send();
});

export default router;
