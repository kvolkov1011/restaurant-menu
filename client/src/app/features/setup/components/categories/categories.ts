import { Component, inject } from '@angular/core';
import {
  MatList,
  MatListItem,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@common';
import { MenuStore } from '@shared/store';
import {
  CategoryDialogComponent,
  CategoryDialogData,
} from '../category-dialog/category-dialog';

@Component({
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  imports: [
    MatButton,
    MatList,
    MatListItem,
    MatListItemMeta,
    MatListItemTitle,
  ],
})
export class CategoriesComponent {
  readonly #menuStore = inject(MenuStore);
  readonly #dialog = inject(MatDialog);

  readonly categories = this.#menuStore.categories;
  readonly error = this.#menuStore.error;
  readonly isLoading = this.#menuStore.isLoading;

  addCategory(): void {
    this.openCategoryDialog();
  }

  editCategory(category: Category): void {
    this.openCategoryDialog({ category });
  }

  deleteCategory(category: Category): void {
    this.#menuStore.deleteCategory(category.id);
  }

  private openCategoryDialog(data?: CategoryDialogData): void {
    const dialogRef = this.#dialog.open<CategoryDialogComponent, CategoryDialogData, Category>(
      CategoryDialogComponent,
      { data },
    );

    dialogRef.afterClosed().subscribe((category) => {
      if (!category) {
        return;
      }

      if (data) {
        this.#menuStore.updateCategory(category);
      } else {
        this.#menuStore.createCategory(category);
      }
    });
  }
}
