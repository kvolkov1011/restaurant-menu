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
import { Category, MenuItem } from '@common';
import { MenuService } from '../services';

type MenuState = {
  categories: Category[];
  menuItems: MenuItem[];
  categoriesLoading: boolean;
  menuItemsLoading: boolean;
  error: string | null;
};

export type MenuRow =
  | { kind: 'category'; category: Category }
  | { kind: 'item'; item: MenuItem };

const initialState: MenuState = {
  categories: [],
  menuItems: [],
  categoriesLoading: false,
  menuItemsLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not load menu data.';

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ categories, menuItems }) => ({
    menuRows: computed<MenuRow[]>(() =>
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
    ),
  })),
  withMethods((store, menuService = inject(MenuService)) => {
    const handleError = (error: unknown): Observable<never> => {
      patchState(store, {
        error: getErrorMessage(error),
        categoriesLoading: false,
        menuItemsLoading: false,
      });
      return EMPTY;
    };

    const refreshCategories = (): Observable<Category[]> =>
      menuService.getCategories().pipe(
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
      menuService.getMenuItems().pipe(
        tap((menuItems) =>
          patchState(store, {
            menuItems,
            menuItemsLoading: false,
            error: null,
          }),
        ),
        catchError(handleError),
      );

    return {
      loadCategories: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { categoriesLoading: true, error: null })),
          switchMap(() => refreshCategories()),
        ),
      ),
      // Mutations keep the current list on screen: only the initial load*()
      // calls set the loading flag, so the list does not blink on every change.
      createCategory: rxMethod<Category>(
        pipe(
          switchMap((category) =>
            menuService.createCategory(category).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      updateCategory: rxMethod<Category>(
        pipe(
          switchMap((category) =>
            menuService.updateCategory(category).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      deleteCategory: rxMethod<string>(
        pipe(
          switchMap((id) =>
            menuService.deleteCategory(id).pipe(
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
      createMenuItem: rxMethod<MenuItem>(
        pipe(
          switchMap((menuItem) =>
            menuService.createMenuItem(menuItem).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      updateMenuItem: rxMethod<MenuItem>(
        pipe(
          switchMap((menuItem) =>
            menuService.updateMenuItem(menuItem).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
      deleteMenuItem: rxMethod<string>(
        pipe(
          switchMap((id) =>
            menuService.deleteMenuItem(id).pipe(
              switchMap(() => refreshMenuItems()),
              catchError(handleError),
            ),
          ),
        ),
      ),
    };
  }),
  withHooks({
    onInit({ loadCategories, loadMenuItems }) {
      loadCategories();
      loadMenuItems();
    },
  }),
);
