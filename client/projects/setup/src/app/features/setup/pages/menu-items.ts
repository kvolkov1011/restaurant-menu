import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItemsComponent } from '../components';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu-items-page',
  template: '<app-menu-items />',
  styleUrl: './setup.css',
  imports: [MenuItemsComponent],
})
export class MenuItemsPage {}
