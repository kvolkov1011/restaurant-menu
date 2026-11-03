import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { SetupStore } from '../store/setup.store';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders.html',
  styleUrl: './orders.css',
  imports: [CurrencyPipe, DatePipe, MatButton, MatIcon],
})
export class OrdersPage {
  readonly #setupStore = inject(SetupStore);

  readonly orders = this.#setupStore.orders;
  readonly isLoading = this.#setupStore.ordersLoading;
  readonly error = this.#setupStore.ordersError;
  readonly totalRevenue = computed(() =>
    this.orders().reduce((total, order) => total + order.total, 0),
  );

  loadOrders(): void {
    this.#setupStore.loadOrders();
  }
}
