import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
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


  listmovies(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    // const body = model;
    return this.http.get(this.apiUrl + 'movie/moviedetails?pageIndex=' + pageIndex + '&pageSize=' + pageSize + '&searchText=' + searchText,
      { headers: this.headers });
  }
  addmovies(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'movie/store', body, { headers: this.headers });
  }
  // updatemovies(model: any): Observable<any> {
  //   const body = model;
  //   return this.http.post(this.apiUrl + 'getmovie/' + model.id, body);
  // }

  // for edit prefill
  getMovieById(id: number): Observable<any> {
  return this.http.get(this.apiUrl + 'getmovie/' + id, { headers: this.headers });
  }

  deleteMovies(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}movie/delete/${id}`, { headers: this.headers });
  }

  getMostWatchedMovies(): Observable<any> {
    return this.http.get(`${this.apiUrl}movies/mostwatchmovie`, {
      headers: this.headers
    });
  }

getLatestMovies(): Observable<any> {
  return this.http.get(`${this.apiUrl}movies/latestmovies`, {
    headers: this.headers
  });
}

}
