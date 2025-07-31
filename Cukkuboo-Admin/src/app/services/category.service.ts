import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get token from localStorage/sessionStorage
  get token(): string | null {
    return sessionStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Set headers with token
  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
    });
  }

 
listCategories(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
  return this.http.get(`${this.apiUrl}category/categories?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${searchText}`, {
    headers: this.headers
  });
}


 
  saveCategory(category: any): Observable<any> {
    return this.http.post(`${this.apiUrl}category/categories`, category, { headers: this.headers });
  }

  deleteCategory(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}category/categories/${id}`, { headers: this.headers });
  }

  getCategoryById(id: string): Observable<any> {
  return this.http.get(`${this.apiUrl}category/categories/${id}`, { headers: this.headers });
}

}
