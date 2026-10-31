import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'setup',
  },
  {
    path: 'setup',
    loadComponent: () => import('./features/setup/pages/setup').then((m) => m.SetupPage),
  },
];
