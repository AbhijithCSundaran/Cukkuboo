import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

get token() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }
  listMovies(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    return this.http.get(`${this.apiUrl}movie/moviedetails?pageIndex=${pageIndex}&pageSize=${pageSize}&searchText=${searchText}`, {
      headers: this.headers
    });
  }


 getMovieById(id: number): Observable<any> {
  return this.http.get(this.apiUrl + 'getmovie/' + id, { headers: this.headers });
  }






}
