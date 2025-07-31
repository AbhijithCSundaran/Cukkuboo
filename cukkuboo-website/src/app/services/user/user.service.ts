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
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
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


  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}user/profile`, { headers: this.headers });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}login/logout`, {}, { headers: this.headers });
  }

  changePassword(model: any): Observable<any> {
    const body = model;
    return this.http.post(`${this.apiUrl}user/change-password`, body, { headers: this.headers });
  }

  deleteAccount(password: string, userId: number) {
    const body = { password: password };
    return this.http.post(`${this.apiUrl}user/delete/${userId}`, body, { headers: this.headers });
  }

  // Google account deletion (no password needed)
  deleteGoogleAccount(id: number): Observable<any> {
   
    return this.http.delete(`${this.apiUrl}user/delete/${id}`, { headers: this.headers });
  }


  //  Forgot Password
  forgotPassword(body: any): Observable<any> {
    return this.http.post(`${this.apiUrl}user/forgot-password`, body, { headers: this.headers });
  }

  googleLogin(model: any): Observable<any> {
    const body = model;
    return this.http.post(`${this.apiUrl}login/google-login`, body, { headers: this.headers });
  }


}