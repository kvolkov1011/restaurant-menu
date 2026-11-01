import { Component, inject } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { map } from 'rxjs';
import { CategoriesComponent, MenuItemsComponent } from '../components';

/** Width below which the two lists are shown one tab at a time. */
const TWO_COLUMN_QUERY = '(min-width: 1024px)';

@Component({
  templateUrl: './setup.html',
  styleUrl: './setup.css',
  imports: [MatTabGroup, MatTab, CategoriesComponent, MenuItemsComponent],
})
export class SetupPage {
  readonly #breakpointObserver = inject(BreakpointObserver);

  readonly isWide = toSignal(
    this.#breakpointObserver.observe(TWO_COLUMN_QUERY).pipe(map((state) => state.matches)),
    { initialValue: false },
  );
}
