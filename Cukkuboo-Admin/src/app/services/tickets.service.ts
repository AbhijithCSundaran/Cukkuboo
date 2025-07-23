import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketsService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Get token from localStorage/sessionStorage
  get token(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  // Auth headers
  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  // List tickets
  listTickets(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    return this.http.get(this.apiUrl + 'support/list?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&search=' + searchText, {
      headers: this.headers
    });
  }

  // Get ticket by ID
  getTicketById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + 'support/listId/' + id, {
      headers: this.headers
    });
  }

  // Edit ticket status or submit
  editstatus(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}support/submit`, data, {
      headers: this.headers
    });
  }

  // Delete ticket by ID
  deleteTicket(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}support/delete/${id}`, {
      headers: this.headers
    });
  }
}
