import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl: string = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  // Token getter from localStorage or sessionStorage
  get token(): string | null {
    return sessionStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Authorization headers
  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }


  getNotifications(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    const url = `${this.apiUrl}notification/global?pageIndex=${pageIndex}&pageSize=${pageSize}&search=${encodeURIComponent(searchText)}`;
    return this.http.get(url, { headers: this.headers });
  }

  
  // Save notification 
  saveNotification(payload: any): Observable<any> {
    const url = `${this.apiUrl}notification/save`;
    return this.http.post(url, payload, { headers: this.headers });
  }

    // Get single notification by ID
  getNotificationById(id: number | string): Observable<any> {
    const url = `${this.apiUrl}notification/get/${id}`;
    return this.http.get(url, { headers: this.headers });
  }
}
