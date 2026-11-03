import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CategoriesComponent } from '../components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-categories-page',
  template: '<app-categories />',
  styleUrl: './setup.css',
  imports: [CategoriesComponent],
})
export class CategoriesPage {}
