import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'menu',
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/pages/menu').then((m) => m.MenuPage),
  },
];
