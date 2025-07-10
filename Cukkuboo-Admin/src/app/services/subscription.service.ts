import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserSubscriptionService {
  private apiUrl: string = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  // Token getter from localStorage or sessionStorage
  get token(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Authorization headers
  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }


  // listUserSubscriptions(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
  //   const url = `${this.apiUrl}usersub/details?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${searchText}`;
  //   return this.http.get(url, { headers: this.headers });
  // }

  listUserSubscriptions(
  pageIndex: number = 0,
  pageSize: number = 10,
  searchText: string = '',
  fromDate: string = '',
  toDate: string = ''
): Observable<any> {
  let url = `${this.apiUrl}usersub/details?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${searchText}`;

  if (fromDate) {
    url += `&fromDate=${fromDate}`;
  }
  if (toDate) {
    url += `&toDate=${toDate}`;
  }

  return this.http.get(url, { headers: this.headers });
}

}
