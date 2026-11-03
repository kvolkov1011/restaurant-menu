import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MenuItem } from '@common';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-price-dialog',
  templateUrl: './price-dialog.html',
  styleUrl: './price-dialog.css',
  imports: [CurrencyPipe, MatButton, MatDialogActions, MatDialogContent, MatDialogTitle],
})
export class PriceDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<PriceDialogComponent>);
  readonly data = inject<{ item: MenuItem }>(MAT_DIALOG_DATA);
  readonly priceDraft = signal(this.data.item.price.toFixed(2));

  setPriceDraft(value: string): void {
    this.priceDraft.set(value);
  }

  setPriceDraftFromEvent(event: Event): void {
    const target = event.target;

    if (!(target instanceof HTMLInputElement)) return;

    this.setPriceDraft(target.value);
  }

  confirm(): void {
    const price = Number(this.priceDraft());

    if (!Number.isFinite(price) || price < this.data.item.price) return;

    this.#dialogRef.close(price);
  }

  cancel(): void {
    this.#dialogRef.close();
  }
}
