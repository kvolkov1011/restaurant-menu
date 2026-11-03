import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, fromEvent } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { Category, MenuItem, Order } from '@common';

@Injectable({
  providedIn: 'root',
})
export class SetupService {
  readonly #http = inject(HttpClient);
  readonly #socket: Socket = io();

  readonly orderChanges$ = fromEvent(this.#socket, 'orders-changed');

  getCategories(): Observable<Category[]> {
    return this.#http.get<Category[]>('/api/categories');
  }

  createCategory(category: Category): Observable<Category> {
    return this.#http.post<Category>('/api/category', category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.#http.put<Category>(`/api/category/${encodeURIComponent(category.id)}`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/category/${encodeURIComponent(id)}`);
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.#http.get<MenuItem[]>('/api/menu-items');
  }

  getOrders(): Observable<Order[]> {
    return this.#http.get<Order[]>('/api/orders');
  }

  createMenuItem(menuItem: MenuItem): Observable<MenuItem> {
    return this.#http.post<MenuItem>('/api/menu-item', menuItem);
  }

  updateMenuItem(menuItem: MenuItem): Observable<MenuItem> {
    return this.#http.put<MenuItem>(`/api/menu-item/${encodeURIComponent(menuItem.id)}`, menuItem);
  }

  deleteMenuItem(id: string): Observable<void> {
    return this.#http.delete<void>(`/api/menu-item/${encodeURIComponent(id)}`);
  }
}
