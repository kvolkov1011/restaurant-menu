import { Component } from '@angular/core';
import { CategoriesComponent } from '../components';

@Component({
  selector: 'app-categories-page',
  template: '<app-categories />',
  styleUrl: './setup.css',
  imports: [CategoriesComponent],
})
export class CategoriesPage {}
