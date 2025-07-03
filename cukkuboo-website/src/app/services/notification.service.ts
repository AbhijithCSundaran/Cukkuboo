import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get token() {
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
  }

  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

 
  saveNotification(data: any): Observable<any> {
    return this.http.post(this.apiUrl + 'notification/save', data, {
      headers: this.headers
    });
  }

getNotifications(pageIndex: number = 0, pageSize: number = 20, searchText: string = ''): Observable<any> {
  const params = {
    pageIndex: pageIndex.toString(),
    pageSize: pageSize.toString(),
    search: searchText
  };
  return this.http.get(this.apiUrl + 'notification/get', {
    headers: this.headers,
    params
  });
}


  
  getNotificationById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + 'notification/get/' + id, {
      headers: this.headers
    });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'notification/delete/' + id, {
      headers: this.headers
    });
  }

 
  markAllAsRead(): Observable<any> {
    return this.http.post(this.apiUrl + 'notification/markall', {}, {
      headers: this.headers
    });
  }
}
