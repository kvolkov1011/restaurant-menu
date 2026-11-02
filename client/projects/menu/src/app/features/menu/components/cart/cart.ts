import { CurrencyPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MenuService } from '../../services/menu.service';
import { MenuStore } from '../../store/menu.store';

const CHECKOUT_MESSAGE_TIMEOUT_MS = 3500;

@Component({
  selector: 'app-cart',
  templateUrl: './cart.html',
  styleUrl: './cart.css',
  imports: [CurrencyPipe, MatButton, MatIconButton, MatIcon],
})
export class CartComponent {
  readonly #menuStore = inject(MenuStore);
  readonly #menuService = inject(MenuService);
  #checkoutMessageTimer: ReturnType<typeof setTimeout> | undefined;

  readonly cartItems = this.#menuStore.cartItems;
  readonly availableCartItems = this.#menuStore.availableCartItems;
  readonly cartCount = this.#menuStore.cartCount;
  readonly cartSubtotal = this.#menuStore.cartSubtotal;
  readonly cartDiscount = this.#menuStore.cartDiscount;
  readonly cartTotal = this.#menuStore.cartTotal;
  readonly houseDiscountPercent = this.#menuStore.houseDiscountPercent;
  readonly cartOpen = signal(false);
  readonly checkoutError = signal<string | null>(null);
  readonly checkoutInProgress = signal(false);

  changeQuantity(itemId: string, delta: number): void {
    this.#menuStore.changeQuantity(itemId, delta);
    if (this.cartItems().length === 0) this.cartOpen.set(false);
  }

  removeFromCart(itemId: string): void {
    this.#menuStore.removeFromCart(itemId);
    if (this.cartItems().length === 0) this.cartOpen.set(false);
  }

  updateCartPrice(itemId: string, value: string): void {
    this.#menuStore.updateCartPrice(itemId, value);
  }

  toggleCart(): void {
    if (this.cartItems().length > 0) this.cartOpen.update((open) => !open);
  }

  checkout(): void {
    if (this.checkoutInProgress() || this.availableCartItems().length === 0) return;

    this.checkoutInProgress.set(true);
    this.checkoutError.set(null);
    const cartItems = this.availableCartItems();

    this.#menuService.getMenuItems().subscribe({
      next: (menuItems) => {
        this.#menuStore.replaceMenuItems(menuItems);
        const changedItem = cartItems.find((cartItem) => {
          const currentItem = menuItems.find((item) => item.id === cartItem.item.id);
          return (
            !currentItem ||
            !currentItem.enabled ||
            currentItem.userPrice !== cartItem.item.userPrice ||
            (!currentItem.userPrice && currentItem.price !== cartItem.price) ||
            (currentItem.userPrice && currentItem.price > cartItem.price)
          );
        });

        if (changedItem) {
          this.showCheckoutMessage(
            'Availability or pricing changed for an item in your order. Review the cart before confirming.',
          );
          this.checkoutInProgress.set(false);
          return;
        }

        this.#menuService
          .placeOrder({
            idempotencyKey: crypto.randomUUID(),
            items: cartItems.map((cartItem) => ({
              itemId: cartItem.item.id,
              quantity: cartItem.quantity,
              price: cartItem.price,
            })),
          })
          .subscribe({
            next: () => {
              this.#menuStore.clearCart();
              this.cartOpen.set(false);
              this.showCheckoutMessage('Order received! Thank you.');
              this.checkoutInProgress.set(false);
            },
            error: (error: unknown) => this.handleCheckoutError(error),
          });
      },
      error: (error: unknown) => this.handleCheckoutError(error),
    });
  }

  private handleCheckoutError(error: unknown): void {
    const response = error instanceof HttpErrorResponse ? error.error : null;
    this.showCheckoutMessage(response?.error ?? 'We could not place your order. Please try again.');
    this.checkoutInProgress.set(false);
  }

  private showCheckoutMessage(message: string): void {
    if (this.#checkoutMessageTimer) clearTimeout(this.#checkoutMessageTimer);

    this.checkoutError.set(message);
    this.#checkoutMessageTimer = setTimeout(() => {
      this.checkoutError.set(null);
      this.#checkoutMessageTimer = undefined;
    }, CHECKOUT_MESSAGE_TIMEOUT_MS);
  }
}
