import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StaffService {
  private apiUrl: string = environment.apiUrl;

  // Get token from localStorage/sessionStorage
  get token() {
    return sessionStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Auth headers
  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  constructor(private http: HttpClient) {}

  // Create new staff
register(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'user/register', body, { headers: this.headers });
  }
  // Get list of staff
 getStaffList(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
  return this.http.get(`${this.apiUrl}staff/list?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${encodeURIComponent(searchText)}`, {
    headers: this.headers
  });
}

  // for edit prefill
  getUserById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}user/profile/${id}`, { headers: this.headers });
  }



  // Delete staff
 deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}user/delete/${id}`, { headers: this.headers });
  }

}