import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { MenuItem } from '@common';
import { PriceDialogComponent } from './price-dialog';

const coffee: MenuItem = {
  id: 'coffee',
  categoryId: 'beverages',
  name: 'Coffee',
  price: 3.5,
  userPrice: true,
  enabled: true,
};

describe('PriceDialogComponent', () => {
  it('closes with a valid customer price', async () => {
    const close = vi.fn();
    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { item: coffee } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new PriceDialogComponent());
    component.setPriceDraft('5.25');
    component.confirm();

    expect(close).toHaveBeenCalledWith(5.25);
  });

  it('does not close below the item minimum and supports cancellation', async () => {
    const close = vi.fn();
    await TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { item: coffee } },
        { provide: MatDialogRef, useValue: { close } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new PriceDialogComponent());
    component.setPriceDraft('3.49');
    component.confirm();
    expect(close).not.toHaveBeenCalled();

    component.cancel();
    expect(close).toHaveBeenCalledWith();
  });
});
