import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '@common';

export type CategoryDialogData = {
  category?: Category;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.html',
  styleUrl: './category-dialog.css',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
  ],
})
export class CategoryDialogComponent {
  readonly #formBuilder = inject(FormBuilder);
  readonly #dialogRef = inject(MatDialogRef<CategoryDialogComponent>);
  readonly data =
    inject<CategoryDialogData | undefined>(MAT_DIALOG_DATA, {
      optional: true,
    }) ?? {};

  readonly isEditing = !!this.data.category;
  readonly form = this.#formBuilder.group({
    id: [
      {
        value: this.data.category?.id ?? '',
        disabled: this.isEditing,
      },
      Validators.required,
    ],
    name: [this.data.category?.name ?? '', Validators.required],
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      return;
    }

    this.#dialogRef.close(this.form.getRawValue());
  }
}
