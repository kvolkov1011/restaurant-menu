import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { fromEvent, Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { CategorySummary, CreateOrderRequest, MenuItem, Order } from '@common';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  readonly #http = inject(HttpClient);
  readonly #socket: Socket = io();

  readonly menuChanges$ = fromEvent(this.#socket, 'menu-changed');

  getCategories(): Observable<CategorySummary[]> {
    return this.#http.get<CategorySummary[]>('/api/categories');
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.#http.get<MenuItem[]>('/api/menu-items');
  }

  placeOrder(request: CreateOrderRequest): Observable<Order> {
    return this.#http.post<Order>('/api/orders', request);
  }
}
