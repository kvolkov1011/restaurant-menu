import { CurrencyPipe } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import {
  Component,
  DestroyRef,
  ElementRef,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatList, MatListItem, MatListItemLine, MatListItemTitle } from '@angular/material/list';
import { MenuRow, MenuStore } from '../store/menu.store';

@Component({
  selector: 'app-menu-page',
  templateUrl: './menu.html',
  styleUrl: './menu.css',
  imports: [
    CurrencyPipe,
    MatButton,
    MatIcon,
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemTitle,
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
  ],
})
export class MenuPage {
  readonly #menuStore = inject(MenuStore);
  readonly #hostElement = inject(ElementRef<HTMLElement>);
  readonly #destroyRef = inject(DestroyRef);
  #viewport?: CdkVirtualScrollViewport;

  readonly categories = this.#menuStore.categories;
  readonly error = this.#menuStore.error;
  readonly isLoading = this.#menuStore.menuItemsLoading;
  readonly selectedCategoryId = signal<string | null>(null);

  readonly visibleMenuRows = computed<MenuRow[]>(() => {
    const selectedCategoryId = this.selectedCategoryId();
    return this.#menuStore.menuRows().filter(
      (row) =>
        !selectedCategoryId ||
        (row.kind === 'item'
          ? row.item.categoryId === selectedCategoryId
          : row.category.id === selectedCategoryId),
    );
  });

  constructor() {
    const resizeObserver = new ResizeObserver(() => this.#viewport?.checkViewportSize());
    resizeObserver.observe(this.#hostElement.nativeElement);
    this.#destroyRef.onDestroy(() => resizeObserver.disconnect());

    effect(() => {
      this.visibleMenuRows();
      queueMicrotask(() => this.#viewport?.checkViewportSize());
    });
  }

  @ViewChild(CdkVirtualScrollViewport)
  set virtualScrollViewport(viewport: CdkVirtualScrollViewport | undefined) {
    this.#viewport = viewport;
    viewport?.checkViewportSize();
  }

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  trackRow(_: number, row: MenuRow): string {
    return row.kind === 'category' ? `category-${row.category.id}` : row.item.id;
  }
}
