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
  return this.http.get(`${this.apiUrl}user/profile`, {
    headers: this.headers
  });
}

logout(): Observable<any> {
  return this.http.post(`${this.apiUrl}login/logout`, {}, { headers: this.headers });
}
changePassword(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}user/change-password`, data, {
    headers: this.headers
  });
}
// changePassword(data: any): Observable<any> {
//   const body = new URLSearchParams();
//   body.set('oldPassword', data.oldPassword);
//   body.set('newPassword', data.newPassword);
//   body.set('confirmPassword', data.confirmPassword);

//   const token = localStorage.getItem('token'); // or however you store the token

//   const headers = {
//     'Content-Type': 'application/x-www-form-urlencoded',
//     'Authorization': `Bearer ${token}`
//   };

//   return this.http.post(`${this.apiUrl}user/change-password`, body.toString(), { headers });
// }

}
