import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  private apiUrl: string = environment.apiUrl;
  

  constructor(private http: HttpClient) { }

  get token() {
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  listPlans(pageIndex: number = 0, pageSize: number = 10, search: string = ''): Observable<any> {
    const params = { pageIndex: pageIndex, pageSize: pageSize, search: search };
    return this.http.get(`${this.apiUrl}subscriptionplan/list`, { headers: this.headers, params });
    // return this.http.get(`${this.apiUrl}subscriptionplan/list?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${searchText}`, {
    //   headers: this.headers
    // });
  }


  // Save user subscription
  saveSubscription(model: any): Observable<any> {
    return this.http.post(`${this.apiUrl}usersub/save`, model, {
      headers: this.headers
    });
  }
  getSubscriptionById(subId: number) {
    return this.http.get(`${this.apiUrl}usersub/get/${subId}`, { headers: this.headers });
  }

  cancelSubscription() {
    return this.http.delete(`${this.apiUrl}usersub/cancelSubscription`, { headers: this.headers });
  }
  getActiveSubscription() {
    return this.http.get(`${this.apiUrl}usersub/active`, { headers: this.headers });
  }
  getSubscriptionHistory(pageIndex: number = 0, pageSize: number = 10,) {
    const params = { pageIndex: pageIndex, pageSize: pageSize };
    return this.http.get(`${this.apiUrl}usersub/history`, { headers: this.headers, params });
  }

   createStripeCheckout(model: any) {
    const body = model
    return this.http.post<any>(`${this.apiUrl}/stripe/test`, body);
  }


}


