import { Component, computed, inject, input, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  MatList,
  MatListItem,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MenuItem } from '@common';
import { MenuItemDialogComponent, MenuItemDialogData } from '../menu-item-dialog/menu-item-dialog';
import { SetupStore } from '../../store/setup.store';

@Component({
  selector: 'app-menu-items',
  templateUrl: './menu-items.html',
  styleUrl: './menu-items.css',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    CurrencyPipe,
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
  ],
})
export class MenuItemsComponent {
  readonly #setupStore = inject(SetupStore);
  readonly #dialog = inject(MatDialog);
  readonly menuItems = this.#setupStore.menuItems;
  readonly categories = this.#setupStore.categories;
  readonly error = this.#setupStore.error;
  readonly isLoading = this.#setupStore.menuItemsLoading;
  readonly selectedCategoryId = signal<string | null>(null);
  readonly searchTerm = signal('');
  readonly filteredMenuItems = computed(() => {
    const categoryId = this.selectedCategoryId();
    const searchTerm = this.searchTerm().trim().toLocaleLowerCase();

    return this.menuItems().filter((menuItem) => {
      const matchesCategory = !categoryId || menuItem.categoryId === categoryId;
      const matchesSearch =
        !searchTerm ||
        menuItem.name.toLocaleLowerCase().includes(searchTerm) ||
        (!!menuItem.description &&
          menuItem.description.toLocaleLowerCase().includes(searchTerm));

      return matchesCategory && matchesSearch;
    });
  });

  /** Hides the panel heading when the section is labelled by a tab. */
  readonly showHeading = input(true);

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  setSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  addMenuItem(): void {
    this.openMenuItemDialog();
  }

  editMenuItem(menuItem: MenuItem): void {
    this.openMenuItemDialog({ menuItem });
  }

  deleteMenuItem(menuItem: MenuItem): void {
    this.#setupStore.deleteMenuItem(menuItem.id);
  }

  toggleEnabled(menuItem: MenuItem): void {
    this.#setupStore.updateMenuItem({ ...menuItem, enabled: !menuItem.enabled });
  }

  categoryName(categoryId: MenuItem['categoryId']): string {
    return this.categories().find((category) => category.id === categoryId)?.name ?? categoryId;
  }

  private openMenuItemDialog(data?: Pick<MenuItemDialogData, 'menuItem'>): void {
    const dialogRef = this.#dialog.open<
      MenuItemDialogComponent,
      MenuItemDialogData,
      MenuItem
    >(MenuItemDialogComponent, {
      width: 'min(560px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      data: {
        ...data,
        categories: this.categories(),
      },
    });

    dialogRef.afterClosed().subscribe((menuItem) => {
      if (!menuItem) {
        return;
      }

      if (data) {
        this.#setupStore.updateMenuItem(menuItem);
      } else {
        this.#setupStore.createMenuItem(menuItem);
      }
    });
  }
}
