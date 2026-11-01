import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '@common';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  readonly #http = inject(HttpClient);

  getCategories(): Observable<Category[]> {
    return this.#http.get<Category[]>('/api/categories');
  }

  createCategory(category: Category): Observable<Category> {
    return this.#http.post<Category>('/api/category', category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.#http.put<Category>(
      `/api/category/${encodeURIComponent(category.id)}`,
      category,
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.#http.delete<void>(
      `/api/category/${encodeURIComponent(id)}`,
    );
  }
}
