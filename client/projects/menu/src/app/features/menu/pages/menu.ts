import { CurrencyPipe } from '@angular/common';
import {
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  VIRTUAL_SCROLL_STRATEGY,
} from '@angular/cdk/scrolling';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  MatList,
  MatListItem,
  MatListItemLine,
  MatListItemMeta,
  MatListItemTitle,
} from '@angular/material/list';
import { MenuItem } from '@common';
import { VariableSizeVirtualScrollStrategy } from '../scrolling/variable-size-virtual-scroll-strategy';
import { MenuRow, MenuStore } from '../store/menu.store';

const variableSizeVirtualScrollStrategy = new VariableSizeVirtualScrollStrategy();

type CartLine = {
  itemId: MenuItem['id'];
  item: MenuItem;
  quantity: number;
  price: number;
  userPrice: boolean;
};

type CartItem = {
  item: MenuItem;
  quantity: number;
  price: number;
};

@Component({
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
    CurrencyPipe,
    MatButton,
    MatIconButton,
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

  readonly categories = this.#menuStore.categories;
  readonly visibleCategories = computed(() =>
    this.categories().filter((category) => category.itemCount > 0),
  );
  readonly error = this.#menuStore.error;
  readonly isLoading = this.#menuStore.menuItemsLoading;
  readonly selectedCategoryId = signal<string | null>(null);
  readonly cart = signal<CartLine[]>([]);
  readonly cartOpen = signal(false);
  readonly priceDialogItem = signal<MenuItem | null>(null);
  readonly priceDraft = signal('');

  readonly cartItems = computed<CartItem[]>(() => {
    const currentItems = new Map(this.#menuStore.menuItems().map((item) => [item.id, item]));

    return this.cart().map((line) => {
      const item = currentItems.get(line.itemId) ?? {
        ...line.item,
        enabled: false,
        description: 'This item is no longer available.',
      };
      const isUserPrice = item.userPrice === true;
      const modeChanged = isUserPrice !== line.userPrice;
      const price = modeChanged
        ? item.price
        : isUserPrice
          ? Math.max(line.price, item.price)
          : item.price;

      return { item, quantity: line.quantity, price };
    });
  });

  readonly availableCartItems = computed(() =>
    this.cartItems().filter((cartItem) => cartItem.item.enabled),
  );

  readonly cartCount = computed(() =>
    this.availableCartItems().reduce((count, cartItem) => count + cartItem.quantity, 0),
  );
  readonly cartSubtotal = computed(() =>
    this.availableCartItems().reduce(
      (total, cartItem) => total + cartItem.price * cartItem.quantity,
      0,
    ),
  );
  readonly cartDiscount = computed(() => this.cartSubtotal() * 0.1);
  readonly cartTotal = computed(() => this.cartSubtotal() - this.cartDiscount());

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

  selectCategory(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  addToCart(item: MenuItem): void {
    if (!item.enabled) return;
    if (item.userPrice) {
      this.priceDialogItem.set(item);
      this.priceDraft.set(item.price.toFixed(2));
      return;
    }
    this.addPricedItem(item, item.price);
  }

  confirmUserPrice(): void {
    const item = this.priceDialogItem();
    const price = Number(this.priceDraft());
    if (!item || !Number.isFinite(price) || price < item.price) return;
    this.addPricedItem(item, price);
    this.priceDialogItem.set(null);
  }

  cancelUserPrice(): void {
    this.priceDialogItem.set(null);
  }

  setPriceDraft(value: string): void {
    this.priceDraft.set(value);
  }

  changeQuantity(itemId: string, delta: number): void {
    this.cart.update((cart) =>
      cart
        .map((cartItem) =>
          cartItem.itemId === itemId
            ? { ...cartItem, quantity: cartItem.quantity + delta }
            : cartItem,
        )
        .filter((cartItem) => cartItem.quantity > 0),
    );
    if (this.cartItems().length === 0) this.cartOpen.set(false);
  }

  removeFromCart(itemId: string): void {
    this.cart.update((cart) => cart.filter((cartItem) => cartItem.itemId !== itemId));
    if (this.cartItems().length === 0) this.cartOpen.set(false);
  }

  updateCartPrice(itemId: string, value: string): void {
    const cartItem = this.cartItems().find((entry) => entry.item.id === itemId);
    const price = Number(value);
    if (
      !cartItem ||
      !cartItem.item.enabled ||
      !Number.isFinite(price) ||
      price < cartItem.item.price
    ) {
      return;
    }
    this.cart.update((cart) =>
      cart.map((cartItem) =>
        cartItem.itemId === itemId
          ? { ...cartItem, price, userPrice: cartItem.item.userPrice === true }
          : cartItem,
      ),
    );
  }

  toggleCart(): void {
    if (this.cartItems().length > 0) this.cartOpen.update((open) => !open);
  }

  private addPricedItem(item: MenuItem, price: number): void {
    this.cart.update((cart) => {
      const existing = cart.find((cartItem) => cartItem.itemId === item.id);
      return existing
        ? cart.map((cartItem) =>
            cartItem.itemId === item.id
              ? { ...cartItem, item, quantity: cartItem.quantity + 1, price, userPrice: item.userPrice === true }
              : cartItem,
          )
        : [...cart, { itemId: item.id, item, price, quantity: 1, userPrice: item.userPrice === true }];
    });
  }

  trackRow(_: number, row: MenuRow): string {
    return row.kind === 'category' ? `category-${row.category.id}` : row.item.id;
  }
}
