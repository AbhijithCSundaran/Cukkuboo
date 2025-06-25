import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanService {

  private apiUrl: string = environment.apiUrl;

  get token() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) {}

  listPlans(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}subscriptionplan/list?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${searchText}`, {
      headers: this.headers
    });
  }

 
}
