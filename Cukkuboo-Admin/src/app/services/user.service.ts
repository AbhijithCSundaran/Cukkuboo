import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl: string = environment.apiUrl;
  // Retrieve the access token from localStorage or sessionStorage
  get token() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }

  // Set headers including the authorization token
  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`, // Add Bearer token
    });
  }
  constructor(private http: HttpClient) { }

  login(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'Login/login', body);
  }

  register(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'user/register', body, { headers: this.headers });
  }

  list(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
     
    return this.http.get(`${this.apiUrl}user/list?pageIndex=${pageIndex}&pageSize=${pageSize}searchText=${searchText}`,
      { headers: this.headers });
  }

  // for edit prefill
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}user/profile/${id}`, { headers: this.headers });
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}user/delete/${id}`, { headers: this.headers });
  }

  logout(): Observable<any> {
    const body = {};
    return this.http.post(this.apiUrl + 'Login/logout', body, { headers: this.headers });
  }

  // staff
  getStaffList(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
  return this.http.get(`${this.apiUrl}staff/list?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${encodeURIComponent(searchText)}`, {
    headers: this.headers
  });
}

}
