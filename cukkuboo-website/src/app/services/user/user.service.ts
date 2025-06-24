import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Getter for token
  get token(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Getter for HTTP headers
  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  login(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}login/login`, model);
  }

  register(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'user/register', body, { headers: this.headers });
  }
  
}
