import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { MenuItem } from '@common';
import { MenuService } from '../../services/menu.service';
import { MenuStore } from '../../store/menu.store';
import { CartComponent } from './cart';

const coffee: MenuItem = {
  id: 'coffee',
  categoryId: 'beverages',
  name: 'Coffee',
  price: 3.5,
  enabled: true,
};

const createStore = () => ({
  cartItems: signal([{ item: coffee, quantity: 1, price: 3.5 }]),
  availableCartItems: signal([{ item: coffee, quantity: 1, price: 3.5 }]),
  cartCount: signal(1),
  cartSubtotal: signal(3.5),
  cartDiscount: signal(0.35),
  cartTotal: signal(3.15),
  houseDiscountPercent: signal(10),
  changeQuantity: vi.fn(),
  clearCart: vi.fn(),
  removeFromCart: vi.fn(),
  replaceMenuItems: vi.fn(),
  updateCartPrice: vi.fn(),
});

describe('CartComponent', () => {
  it('delegates quantity, removal, and price changes to the store', async () => {
    const store = createStore();
    await TestBed.configureTestingModule({
      providers: [
        { provide: MenuStore, useValue: store },
        { provide: MenuService, useValue: { getMenuItems: vi.fn(), placeOrder: vi.fn() } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new CartComponent());
    component.changeQuantity('coffee', 1);
    component.removeFromCart('coffee');
    component.updateCartPrice('coffee', '4.25');

    expect(store.changeQuantity).toHaveBeenCalledWith('coffee', 1);
    expect(store.removeFromCart).toHaveBeenCalledWith('coffee');
    expect(store.updateCartPrice).toHaveBeenCalledWith('coffee', '4.25');
  });

  it('refreshes before checkout and clears the cart after success', async () => {
    const store = createStore();
    const getMenuItems = vi.fn(() => of([coffee]));
    const placeOrder = vi.fn(() => of({}));
    await TestBed.configureTestingModule({
      providers: [
        { provide: MenuStore, useValue: store },
        { provide: MenuService, useValue: { getMenuItems, placeOrder } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new CartComponent());
    component.checkout();

    expect(getMenuItems).toHaveBeenCalledOnce();
    expect(placeOrder).toHaveBeenCalledWith({
      idempotencyKey: expect.any(String),
      items: [{ itemId: 'coffee', quantity: 1, price: 3.5 }],
    });
    expect(store.clearCart).toHaveBeenCalledOnce();
    expect(component.checkoutError()).toBe('Order received! Thank you.');
  });
});
