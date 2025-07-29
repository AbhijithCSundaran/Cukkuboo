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
    return sessionStorage.getItem('token') || sessionStorage.getItem('token');
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) {}

  listPlans(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}subscriptionplan/list?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${searchText}`, {
      headers: this.headers
    });
  }

  addPlan(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}subscriptionplan/save`, model, { headers: this.headers });
  }

  getPlanById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}subscriptionplan/get/${id}`, { headers: this.headers });
  }

 

  deletePlan(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}subscriptionplan/delete/${id}`, { headers: this.headers });
  }
}
