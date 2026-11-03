import { CurrencyPipe } from '@angular/common';
import {
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { MenuItem } from '@common';
import { CartComponent } from '../components/cart/cart';
import { PriceDialogComponent } from '../components/price-dialog/price-dialog';
import { VariableSizeVirtualScrollStrategy } from '../scrolling/variable-size-virtual-scroll-strategy';
import { MenuRow, MenuStore } from '../store/menu.store';

const variableSizeVirtualScrollStrategy = new VariableSizeVirtualScrollStrategy();
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-menu-page',
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  providers: [
    {
      provide: VIRTUAL_SCROLL_STRATEGY,
      useValue: variableSizeVirtualScrollStrategy,
    },
  ],
  imports: [
    CartComponent,
    CurrencyPipe,
    MatButton,
    MatIcon,
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
  ],
})
export class MenuPage {
  readonly #menuStore = inject(MenuStore);
  readonly #dialog = inject(MatDialog);

  readonly categories = this.#menuStore.categories;
  readonly visibleCategories = computed(() =>
    this.categories().filter((category) => category.itemCount > 0),
  );
  readonly error = this.#menuStore.error;
  readonly isLoading = this.#menuStore.menuItemsLoading;
  readonly selectedCategoryId = signal<string | null>(null);

  readonly visibleMenuRows = computed<MenuRow[]>(() => {
    const selectedCategoryId = this.selectedCategoryId();
    return this.#menuStore
      .menuRows()
      .filter(
        (row) =>
          !selectedCategoryId ||
          (row.kind === 'item'
            ? row.item.categoryId === selectedCategoryId
            : row.category.id === selectedCategoryId),
      );
  });

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  addToCart(item: MenuItem): void {
    if (!item.enabled) return;
    if (item.userPrice) {
      this.#dialog
        .open(PriceDialogComponent, {
          ariaLabel: `Choose price for ${item.name}`,
          data: { item },
        })
        .afterClosed()
        .subscribe((price: number | undefined) => {
          if (price !== undefined) this.#menuStore.addPricedItem(item, price);
        });
      return;
    }
    this.#menuStore.addPricedItem(item, item.price);
  }

  trackRow(_: number, row: MenuRow): string {
    return row.kind === 'category' ? `category-${row.category.id}` : row.item.id;
  }
}
