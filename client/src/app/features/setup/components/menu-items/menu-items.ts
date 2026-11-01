import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  ViewChild,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
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
import { MenuStore } from '@shared/store';

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
    CdkVirtualForOf,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    MatList,
    MatListItem,
    MatListItemLine,
    MatListItemMeta,
    MatListItemTitle,
  ],
})
export class MenuItemsComponent {
  readonly #menuStore = inject(MenuStore);
  readonly #dialog = inject(MatDialog);
  readonly #hostElement = inject(ElementRef<HTMLElement>);
  readonly #destroyRef = inject(DestroyRef);
  #viewport?: CdkVirtualScrollViewport;

  @ViewChild(CdkVirtualScrollViewport)
  set virtualScrollViewport(viewport: CdkVirtualScrollViewport | undefined) {
    this.#viewport = viewport;
    viewport?.checkViewportSize();
  }

  readonly menuItems = this.#menuStore.menuItems;
  readonly categories = this.#menuStore.categories;
  readonly error = this.#menuStore.error;
  readonly isLoading = this.#menuStore.menuItemsLoading;

  /** Hides the panel heading when the section is labelled by a tab. */
  readonly showHeading = input(true);

  constructor() {
    const resizeObserver = new ResizeObserver(() => {
      this.#viewport?.checkViewportSize();
    });

    resizeObserver.observe(this.#hostElement.nativeElement);
    this.#destroyRef.onDestroy(() => resizeObserver.disconnect());
  }

  addMenuItem(): void {
    this.openMenuItemDialog();
  }

  editMenuItem(menuItem: MenuItem): void {
    this.openMenuItemDialog({ menuItem });
  }

  deleteMenuItem(menuItem: MenuItem): void {
    this.#menuStore.deleteMenuItem(menuItem.id);
  }

  toggleEnabled(menuItem: MenuItem): void {
    this.#menuStore.updateMenuItem({ ...menuItem, enabled: !menuItem.enabled });
  }

  categoryName(categoryId: MenuItem['categoryId']): string {
    return this.categories().find((category) => category.id === categoryId)?.name ?? categoryId;
  }

  trackMenuItem(_: number, menuItem: MenuItem): string {
    return menuItem.id;
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
        this.#menuStore.updateMenuItem(menuItem);
      } else {
        this.#menuStore.createMenuItem(menuItem);
      }
    });
  }
}
