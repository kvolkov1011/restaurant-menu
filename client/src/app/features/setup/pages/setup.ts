import { Component } from '@angular/core';
import { CategoriesComponent, MenuItemsComponent } from '../components';

@Component({
  templateUrl: './setup.html',
  styleUrl: './setup.css',
  imports: [CategoriesComponent, MenuItemsComponent],
})
export class SetupPage {}
