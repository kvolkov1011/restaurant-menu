import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/menu/pages/menu').then((m) => m.MenuPage),
  },
];
