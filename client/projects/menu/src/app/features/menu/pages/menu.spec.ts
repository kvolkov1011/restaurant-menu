import { signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CategorySummary, MenuItem } from '@common';
import { MenuService } from '../services/menu.service';
import { MenuStore } from '../store/menu.store';
import { MenuPage } from './menu';

const fixedItem: MenuItem = {
  id: 'salad',
  categoryId: 'food',
  name: 'Salad',
  price: 8,
  enabled: true,
};
const category: CategorySummary = { id: 'food', name: 'Food', itemCount: 1 };

const createStore = () => ({
  categories: signal([category]),
  menuItems: signal([fixedItem]),
  menuItemsLoading: signal(false),
  error: signal<string | null>(null),
  menuRows: signal([{ kind: 'item' as const, item: fixedItem }]),
  addPricedItem: vi.fn(),
});

describe('MenuPage', () => {
  it('filters rows by category and adds fixed-price items', async () => {
    const store = createStore();
    await TestBed.configureTestingModule({
      providers: [
        { provide: MenuStore, useValue: store },
        { provide: MenuService, useValue: { getMenuItems: vi.fn(), getCategories: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new MenuPage());
    component.selectCategory('food');
    expect(component.visibleMenuRows()).toHaveLength(1);

    component.addToCart(fixedItem);
    expect(store.addPricedItem).toHaveBeenCalledWith(fixedItem, 8);
  });

  it('uses the price dialog for customer-priced items', async () => {
    const store = createStore();
    const userPricedItem = { ...fixedItem, userPrice: true };
    const open = vi.fn(() => ({ afterClosed: () => of(10) }));
    await TestBed.configureTestingModule({
      providers: [
        { provide: MenuStore, useValue: store },
        { provide: MenuService, useValue: { getMenuItems: vi.fn(), getCategories: vi.fn() } },
        { provide: MatDialog, useValue: { open } },
      ],
    });

    const component = TestBed.runInInjectionContext(() => new MenuPage());
    component.addToCart(userPricedItem);

    expect(open).toHaveBeenCalledOnce();
    expect(store.addPricedItem).toHaveBeenCalledWith(userPricedItem, 10);
  });
});
