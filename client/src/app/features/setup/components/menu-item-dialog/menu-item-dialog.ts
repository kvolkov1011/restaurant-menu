import { Component, DestroyRef, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatError,
  MatFormField,
  MatLabel,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Category, MenuItem } from '@common';

export type MenuItemDialogData = {
  menuItem?: MenuItem;
  categories: Category[];
};

@Component({
  selector: 'app-menu-item-dialog',
  templateUrl: './menu-item-dialog.html',
  styleUrl: './menu-item-dialog.css',
  imports: [
    MatButton,
    MatCheckbox,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    MatPrefix,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
  ],
})
export class MenuItemDialogComponent {
  readonly #formBuilder = inject(FormBuilder);
  readonly #dialogRef = inject(MatDialogRef<MenuItemDialogComponent>);
  readonly #destroyRef = inject(DestroyRef);
  readonly data =
    inject<MenuItemDialogData | undefined>(MAT_DIALOG_DATA, {
      optional: true,
    }) ?? { categories: [] };

  readonly isEditing = !!this.data.menuItem;
  readonly form = this.#formBuilder.group({
    id: [
      {
        value: this.data.menuItem?.id ?? '',
        disabled: this.isEditing,
      },
      Validators.required,
    ],
    categoryId: [this.data.menuItem?.categoryId ?? '', Validators.required],
    name: [this.data.menuItem?.name ?? '', Validators.required],
    description: [this.data.menuItem?.description ?? ''],
    price: [
      this.data.menuItem?.price ?? 0,
      [Validators.required, Validators.min(0)],
    ],
    userPrice: [this.data.menuItem?.userPrice ?? false],
    enabled: [this.data.menuItem?.enabled ?? true],
  });

  constructor() {
    this.setPriceEnabled(!this.form.controls.userPrice.value);
    this.form.controls.userPrice.valueChanges
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((userPrice) => this.setPriceEnabled(!userPrice));
  }

  private setPriceEnabled(enabled: boolean): void {
    if (enabled && this.form.controls.price.disabled) {
      this.form.controls.price.enable();
    } else if (!enabled && this.form.controls.price.enabled) {
      this.form.controls.price.disable();
    }
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.#dialogRef.close(this.form.getRawValue());
  }
}
