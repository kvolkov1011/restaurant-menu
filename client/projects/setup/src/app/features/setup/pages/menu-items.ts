import { Component } from '@angular/core';
import { MenuItemsComponent } from '../components';

@Component({
  selector: 'app-menu-items-page',
  template: '<app-menu-items />',
  styleUrl: './setup.css',
  imports: [MenuItemsComponent],
})
export class MenuItemsPage {}
