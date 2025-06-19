import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ReelsService {

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


   listReels(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    // const body = model;
    return this.http.get(this.apiUrl + 'reels/details?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&searchText=' + searchText,
      { headers: this.headers });
  }
  addReels(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'reels/add', body, { headers: this.headers });
  }
  

  // for edit prefill
  getReelsById(id: number): Observable<any> {
  return this.http.get(this.apiUrl + 'reels/get/' + id, { headers: this.headers });
  }

  deleteReels(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}reels/delete/${id}`, { headers: this.headers });
  }


}
