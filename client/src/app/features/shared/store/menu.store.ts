import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { EMPTY, Observable, catchError, pipe, switchMap, tap } from 'rxjs';
import { Category } from '@common';
import { MenuService } from '../services';

type MenuState = {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
};

const initialState: MenuState = {
  categories: [],
  isLoading: false,
  error: null,
};

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Could not load menu data.';

export const MenuStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, menuService = inject(MenuService)) => {
    const handleError = (error: unknown): Observable<never> => {
      patchState(store, {
        error: getErrorMessage(error),
        isLoading: false,
      });
      return EMPTY;
    };

    const refreshCategories = (): Observable<Category[]> =>
      menuService.getCategories().pipe(
        tap((categories) =>
          patchState(store, {
            categories,
            error: null,
            isLoading: false,
          }),
        ),
        catchError(handleError),
      );

    return {
      loadCategories: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { error: null, isLoading: true })),
          switchMap(() => refreshCategories()),
        ),
      ),
      createCategory: rxMethod<Category>(
        pipe(
          tap(() => patchState(store, { error: null, isLoading: true })),
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
          tap(() => patchState(store, { error: null, isLoading: true })),
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
          tap(() => patchState(store, { error: null, isLoading: true })),
          switchMap((id) =>
            menuService.deleteCategory(id).pipe(
              switchMap(() => refreshCategories()),
              catchError(handleError),
            ),
          ),
        ),
      ),
    };
  }),
  withHooks({
    onInit({ loadCategories }) {
      loadCategories();
    },
  }),
);
