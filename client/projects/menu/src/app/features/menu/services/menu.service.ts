import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, MenuItem } from '@common';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  readonly #http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.#http.get<Category[]>('/api/categories');
  }

  getMenuItems(): Observable<MenuItem[]> {
    return this.#http.get<MenuItem[]>('/api/menu-items');
  }
}
