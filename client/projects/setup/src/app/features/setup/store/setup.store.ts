import { DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, Observable, catchError, pipe, switchMap, tap } from 'rxjs';
import { Category, MenuItem, Order } from '@common';
import { SetupService } from '../services/setup.service';

type SetupState = {
  categories: Category[];
  menuItems: MenuItem[];
  orders: Order[];
  categoriesLoading: boolean;
  menuItemsLoading: boolean;
  ordersLoading: boolean;
  error: string | null;
  ordersError: string | null;
};

const initialState: SetupState = {
  categories: [],
  menuItems: [],
  orders: [],
  categoriesLoading: false,
  menuItemsLoading: false,
  ordersLoading: false,
  error: null,
  ordersError: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not load menu data.';

export const SetupStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, setupService = inject(SetupService)) => {
    const handleError = (error: unknown): Observable<never> => {
      patchState(store, {
        error: getErrorMessage(error),
        categoriesLoading: false,
        menuItemsLoading: false,
        ordersLoading: false,
      });
      return EMPTY;
    };

    const refreshCategories = (): Observable<Category[]> =>
      setupService.getCategories().pipe(
        tap((categories) =>
          patchState(store, {
            categories,
            categoriesLoading: false,
            error: null,
          }),
        ),
        catchError(handleError),
      );

    const refreshMenuItems = (): Observable<MenuItem[]> =>
      setupService.getMenuItems().pipe(
        tap((menuItems) =>
          patchState(store, {
            menuItems,
            menuItemsLoading: false,
            error: null,
          }),
        ),
        catchError(handleError),
      );

    const handleOrdersError = (error: unknown): Observable<never> => {
      patchState(store, {
        ordersError: error instanceof Error ? error.message : 'Could not load orders.',
        ordersLoading: false,
      });
      return EMPTY;
    };

    const refreshOrders = (): Observable<Order[]> =>
      setupService.getOrders().pipe(
        tap((orders) =>
          patchState(store, {
            orders,
            ordersLoading: false,
            ordersError: null,
          }),
        ),
        catchError(handleOrdersError),
      );

    return {
      loadCategories: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { categoriesLoading: true, error: null })),
          switchMap(() => refreshCategories()),
        ),
      ),
      createCategory: rxMethod<Category>(
        pipe(
          switchMap((category) =>
            setupService.createCategory(category).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      updateCategory: rxMethod<Category>(
        pipe(
          switchMap((category) =>
            setupService.updateCategory(category).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      deleteCategory: rxMethod<string>(
        pipe(
          switchMap((id) =>
            setupService.deleteCategory(id).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      loadMenuItems: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { menuItemsLoading: true, error: null })),
          switchMap(() => refreshMenuItems()),
        ),
      ),
      loadOrders: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { ordersLoading: true, ordersError: null })),
          switchMap(() => refreshOrders()),
        ),
      ),
      createMenuItem: rxMethod<MenuItem>(
        pipe(
          switchMap((menuItem) =>
            setupService.createMenuItem(menuItem).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      updateMenuItem: rxMethod<MenuItem>(
        pipe(
          switchMap((menuItem) =>
            setupService.updateMenuItem(menuItem).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      deleteMenuItem: rxMethod<string>(
        pipe(
          switchMap((id) =>
            setupService.deleteMenuItem(id).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
    };
  }),
  withHooks({
    onInit({ loadCategories, loadMenuItems, loadOrders }) {
      loadCategories();
      loadMenuItems();
      loadOrders();

      const setupService = inject(SetupService);
      const destroyRef = inject(DestroyRef);

      setupService.orderChanges$.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => loadOrders());
    },
  }),
);
