import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HelpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
  }

  get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  submitHelpRequest(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}support/submit`, data, {
      headers: this.headers
    });
  }

 
}
