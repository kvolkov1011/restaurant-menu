import { Category } from '@common';
import { MenuItem } from '@common';

export const categories: Category[] = [
  { id: '1', name: 'Beverages' },
  { id: '2', name: 'Appetizers' },
  { id: '3', name: 'Main Course' },
  { id: '4', name: 'Desserts' },
  { id: '5', name: 'Salads' },
];

export const menuItems: MenuItem[] = [
  {
    id: 'coffee',
    categoryId: '1',
    name: 'Coffee',
    description: 'Freshly brewed coffee',
    price: 3.5,
    enabled: true,
  },
  {
    id: 'caesar-salad',
    categoryId: '5',
    name: 'Caesar Salad',
    description: 'Crisp romaine, parmesan, and croutons',
    price: 8.5,
    enabled: true,
  },
  {
    id: 'bruschetta',
    categoryId: '2',
    name: 'Bruschetta',
    description: 'Toasted ciabatta with tomatoes, basil, and olive oil',
    price: 7.5,
    enabled: true,
  },
  {
    id: 'garlic-bread',
    categoryId: '2',
    name: 'Garlic Bread',
    description: 'Warm sourdough with roasted garlic butter',
    price: 5.5,
    enabled: true,
  },
  {
    id: 'margherita-pizza',
    categoryId: '3',
    name: 'Margherita Pizza',
    description: 'Tomato, mozzarella, basil, and extra virgin olive oil',
    price: 12,
    enabled: true,
  },
  {
    id: 'grilled-salmon',
    categoryId: '3',
    name: 'Grilled Salmon',
    description: 'Atlantic salmon with lemon herbs and seasonal vegetables',
    price: 18.5,
    enabled: true,
  },
  {
    id: 'chicken-pasta',
    categoryId: '3',
    name: 'Chicken Pasta',
    description: 'Penne with grilled chicken, spinach, and parmesan cream sauce',
    price: 14.5,
    enabled: true,
  },
  {
    id: 'chocolate-cake',
    categoryId: '4',
    name: 'Chocolate Cake',
    description: 'Rich chocolate sponge with silky ganache',
    price: 7,
    enabled: true,
  },
  {
    id: 'lemon-cheesecake',
    categoryId: '4',
    name: 'Lemon Cheesecake',
    description: 'Creamy cheesecake with lemon curd and biscuit base',
    price: 7.5,
    enabled: true,
  },
  {
    id: 'iced-tea',
    categoryId: '1',
    name: 'Iced Tea',
    description: 'House brewed black tea with lemon and mint',
    price: 4,
    enabled: true,
  },
];
