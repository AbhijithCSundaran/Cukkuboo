import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
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


 listcategory(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'User/register', body);
  }
  addcategory(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'User/register', body);
  }
  updatecategory(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'User/register', body);
  }
  
 deletecategory(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'User/register', body);
  }
  
}
