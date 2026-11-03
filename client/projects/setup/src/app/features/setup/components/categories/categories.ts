import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatList, MatListItem, MatListItemMeta, MatListItemTitle } from '@angular/material/list';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Category } from '@common';
import { SetupStore } from '../../store/setup.store';
import { CategoryDialogComponent, CategoryDialogData } from '../category-dialog/category-dialog';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-categories',
  templateUrl: './categories.html',
  styleUrl: './categories.css',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    MatList,
    MatListItem,
    MatListItemMeta,
    MatListItemTitle,
  ],
})
export class CategoriesComponent {
  readonly #setupStore = inject(SetupStore);
  readonly #dialog = inject(MatDialog);

  readonly categories = this.#setupStore.categories;
  readonly error = this.#setupStore.error;
  readonly isLoading = this.#setupStore.categoriesLoading;

  /** Hides the panel heading when the section is labelled by a tab. */
  readonly showHeading = input(true);

  addCategory(): void {
    this.#openCategoryDialog();
  }

  editCategory(category: Category): void {
    this.#openCategoryDialog({ category });
  }

  deleteCategory(category: Category): void {
    this.#setupStore.deleteCategory(category.id);
  }

  #openCategoryDialog(data?: CategoryDialogData): void {
    const dialogRef = this.#dialog.open<CategoryDialogComponent, CategoryDialogData, Category>(
      CategoryDialogComponent,
      { data },
    );

    dialogRef.afterClosed().subscribe((category) => {
      if (!category) {
        return;
      }

      if (data) {
        this.#setupStore.updateCategory(category);
      } else {
        this.#setupStore.createCategory(category);
      }
    });
  }
}
