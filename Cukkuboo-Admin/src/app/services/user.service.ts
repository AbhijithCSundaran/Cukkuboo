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
    return this.http.post(this.apiUrl + 'User/register', body);
  }

 list(model: any): Observable<any> {
    const body = model;
    return this.http.get(this.apiUrl + 'User/list', body);
  }


  // for edit prefill
  getUserById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + 'getuser/' + id);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl} user/delete`, { mov_id: id });
  }

  logout(): Observable<any> {
    const body = {};
    return this.http.post(this.apiUrl + 'logout', body, { headers: this.headers });
  }
}
