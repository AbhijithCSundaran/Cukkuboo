import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PoliciesService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get token() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  // Create new policy
  createPolicy(type: string, title: string, content: string): Observable<any> {
    const data = { type, title, content };
    return this.http.post(`${this.apiUrl}policy/create`, data, { headers: this.headers });
  }

  // List policies
listPolicies(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
  return this.http.get(this.apiUrl + 'policy/listPolicy?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&search=' + searchText, {
    headers: this.headers
  });
}

// Get single policy by ID
getPolicyById(id: number): Observable<any> {
  return this.http.get(`${this.apiUrl}policy/list/${id}`, {
    headers: this.headers
  });
}

}
