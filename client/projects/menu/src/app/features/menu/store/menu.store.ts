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
import { CategorySummary, MenuItem } from '@common';
import { MenuService } from '../services/menu.service';

type MenuState = {
  categories: CategorySummary[];
  menuItems: MenuItem[];
  categoriesLoading: boolean;
  menuItemsLoading: boolean;
  error: string | null;
};

export type MenuRow =
  | { kind: 'category'; category: CategorySummary }
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

    return { loadCategories, loadMenuItems, watchChanges };
  }),
  withHooks({
    onInit({ loadCategories, loadMenuItems, watchChanges }) {
      loadCategories();
      loadMenuItems();
      watchChanges();
    },
  }),
);
