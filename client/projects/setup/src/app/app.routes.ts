import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'categories',
  },
  {
    path: 'categories',
    loadComponent: () =>
      import('./features/setup/pages/categories').then((m) => m.CategoriesPage),
  },
  {
    path: 'menu-items',
    loadComponent: () =>
      import('./features/setup/pages/menu-items').then((m) => m.MenuItemsPage),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/setup/pages/orders').then((m) => m.OrdersPage),
  },
];
