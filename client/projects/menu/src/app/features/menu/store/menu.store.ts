import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, Observable, catchError, pipe, switchMap, tap } from 'rxjs';
import { CategorySummary, HOUSE_DISCOUNT_RATE, MenuItem } from '@common';
import { MenuService } from '../services/menu.service';

type MenuState = {
  categories: CategorySummary[];
  menuItems: MenuItem[];
  cart: CartLine[];
  categoriesLoading: boolean;
  menuItemsLoading: boolean;
  error: string | null;
};

type CartLine = {
  itemId: MenuItem['id'];
  item: MenuItem;
  quantity: number;
  price: number;
  userPrice: boolean;
};

export type CartItem = {
  item: MenuItem;
  quantity: number;
  price: number;
};

export type MenuRow =
  | { kind: 'category'; category: CategorySummary }
  | { kind: 'item'; item: MenuItem };

const initialState: MenuState = {
  categories: [],
  menuItems: [],
  cart: [],
  categoriesLoading: false,
  menuItemsLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not load menu data.';

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories, menuItems, cart }) => {
    const menuRows = computed<MenuRow[]>(() =>
      categories()
        .map((category) => ({
          category,
          items: menuItems().filter((item) => item.categoryId === category.id),
        }))
        .filter((group) => group.items.length > 0)
        .flatMap(({ category, items }) => [
          { kind: 'category' as const, category },
          ...items.map((item) => ({ kind: 'item' as const, item })),
        ]),
    );
    const cartItems = computed<CartItem[]>(() => {
      const currentItems = new Map(menuItems().map((item) => [item.id, item]));

      return cart().map((line) => {
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
    const availableCartItems = computed(() => cartItems().filter((cartItem) => cartItem.item.enabled));
    const cartCount = computed(() =>
      availableCartItems().reduce((count, cartItem) => count + cartItem.quantity, 0),
    );
    const cartSubtotal = computed(() =>
      availableCartItems().reduce(
        (total, cartItem) => total + cartItem.price * cartItem.quantity,
        0,
      ),
    );
    const cartDiscount = computed(() => cartSubtotal() * HOUSE_DISCOUNT_RATE);
    const cartTotal = computed(() => cartSubtotal() - cartDiscount());

    return {
      cartDiscount,
      cartItems,
      cartCount,
      cartSubtotal,
      cartTotal,
      availableCartItems,
      houseDiscountPercent: computed(() => HOUSE_DISCOUNT_RATE * 100),
      menuRows,
    };
  }),
  withMethods((store, menuService = inject(MenuService)) => {
    const load = <T>(request: Observable<T>): Observable<T> =>
      request.pipe(
        catchError((error) => {
          patchState(store, {
            error: getErrorMessage(error),
            categoriesLoading: false,
            menuItemsLoading: false,
          });
          return EMPTY;
        }),
      );

    const loadCategories = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { categoriesLoading: true, error: null })),
        switchMap(() =>
          load(menuService.getCategories()).pipe(
            tap((categories) =>
              patchState(store, {
                categories,
                categoriesLoading: false,
                error: null,
              }),
            ),
          ),
        ),
      ),
    );

    const loadMenuItems = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { menuItemsLoading: true, error: null })),
        switchMap(() =>
          load(menuService.getMenuItems()).pipe(
            tap((menuItems) =>
              patchState(store, {
                menuItems,
                menuItemsLoading: false,
                error: null,
              }),
            ),
          ),
        ),
      ),
    );

    const watchChanges = rxMethod<void>(
      pipe(
        switchMap(() => menuService.menuChanges$),
        tap(() => {
          loadCategories();
          loadMenuItems();
        }),
      ),
    );

    const replaceMenuItems = (menuItems: MenuItem[]): void => {
      patchState(store, { menuItems, menuItemsLoading: false, error: null });
    };

    const addPricedItem = (item: MenuItem, price: number): void => {
      patchState(store, ({ cart }) => {
        const existing = cart.find((cartItem) => cartItem.itemId === item.id);
        const nextCart = existing
          ? cart.map((cartItem) =>
              cartItem.itemId === item.id
                ? {
                    ...cartItem,
                    item,
                    quantity: cartItem.quantity + 1,
                    price,
                    userPrice: item.userPrice === true,
                  }
                : cartItem,
            )
          : [...cart, { itemId: item.id, item, price, quantity: 1, userPrice: item.userPrice === true }];

        return { cart: nextCart };
      });
    };

    const changeQuantity = (itemId: string, delta: number): void => {
      patchState(store, ({ cart }) => ({
        cart: cart
          .map((cartItem) =>
            cartItem.itemId === itemId
              ? { ...cartItem, quantity: cartItem.quantity + delta }
              : cartItem,
          )
          .filter((cartItem) => cartItem.quantity > 0),
      }));
    };

    const removeFromCart = (itemId: string): void => {
      patchState(store, ({ cart }) => ({
        cart: cart.filter((cartItem) => cartItem.itemId !== itemId),
      }));
    };

    const updateCartPrice = (itemId: string, value: string): void => {
      const cartItem = store.cartItems().find((entry) => entry.item.id === itemId);
      const price = Number(value);
      if (
        !cartItem ||
        !cartItem.item.enabled ||
        !Number.isFinite(price) ||
        price < cartItem.item.price
      ) {
        return;
      }

      patchState(store, ({ cart }) => ({
        cart: cart.map((line) =>
          line.itemId === itemId
            ? { ...line, price, userPrice: cartItem.item.userPrice === true }
            : line,
        ),
      }));
    };

    const clearCart = (): void => patchState(store, { cart: [] });

    return {
      addPricedItem,
      changeQuantity,
      clearCart,
      loadCategories,
      loadMenuItems,
      removeFromCart,
      replaceMenuItems,
      updateCartPrice,
      watchChanges,
    };
  }),
  withHooks({
    onInit({ loadCategories, loadMenuItems, watchChanges }) {
      loadCategories();
      loadMenuItems();
      watchChanges();
    },
  }),
);
