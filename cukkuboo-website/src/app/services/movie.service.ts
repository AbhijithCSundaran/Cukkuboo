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
    return localStorage.getItem('t_k') || sessionStorage.getItem('token');
  }
  get headers() {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
  }

  // listMovies(pageIndex: number = 0, pageSize: number = 20, searchText: string = ''): Observable<any> {
  // return this.http.get(this.apiUrl + 'movie/moviedetails?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&searchText=' + searchText,
  //     { headers: this.headers });
  // }

  listMovies(pageIndex: number = 0, pageSize: number = 20, searchText: string = ''): Observable<any> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString(), search: searchText };
    return this.http.get(this.apiUrl + 'movie/moviedetails', { headers: this.headers, params });
  }

  getrelatedMovies(id: number, pageIndex: number = 0, pageSize: number = 20): Observable<any> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString() };
    return this.http.get(this.apiUrl + `movies/related/${id}`, { headers: this.headers, params });
  }

  getMovieById(id: number): Observable<any> {
    return this.http.get(this.apiUrl + 'getmovie/' + id, { headers: this.headers });
  }

  getHomeData(): Observable<any> {
    return this.http.get(`${this.apiUrl}movies/userDashboard`, {
      headers: this.headers
    });
  }

getReelsData(): Observable<any> {
  return this.http.get(`${this.apiUrl}reels/details`, {
    headers: this.headers
  });
}

}
