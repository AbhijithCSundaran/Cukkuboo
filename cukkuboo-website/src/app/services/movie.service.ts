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

  listMovies(pageIndex: number = 0, pageSize: number = 20, searchText: string = '', type: string = ''): Observable<any> {
    if (!type) {
      const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString(), search: searchText };
      return this.http.get(this.apiUrl + 'movie/moviedetails', { headers: this.headers, params });
    }
    else {
      const params = { type: type, page: pageIndex, limit: pageSize, search: searchText };
      return this.http.get(this.apiUrl + 'movies/list', { headers: this.headers, params });
    }

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

  saveHistory(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'savehistory/save', body, { headers: this.headers });
  }

  getHistory(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    const params = { page: pageIndex.toString(), size: pageSize.toString(), search: searchText };
    return this.http.get(this.apiUrl + 'savehistory/user', { headers: this.headers, params });
  }


  deleteHistoryItem(historyId: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'savehistory/delete/' + historyId, {
      headers: this.headers
    });
  }

  clearAllHistory(): Observable<any> {
    return this.http.delete(this.apiUrl + 'savehistory/clear-all', { headers: this.headers });
  }

  saveWatchlater(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'watch/save', body, { headers: this.headers });
  }

  getWatchLaterList(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    const params = {
      page: pageIndex.toString(),
      size: pageSize.toString(),
      search: searchText
    };
    return this.http.get(this.apiUrl + 'watch/user', { headers: this.headers, params });
  }


  deleteWatchLater(watchId: number): Observable<any> {
    return this.http.delete(this.apiUrl + 'watch/delete/' + watchId, { headers: this.headers });
  }


  clearAllWatchLater(): Observable<any> {
    return this.http.delete(this.apiUrl + 'watch/clear-all', { headers: this.headers });
  }


  getReelsData(pageIndex: number = 0, pageSize: number = 10, searchText: string = ''): Observable<any> {
    const params = { pageIndex: pageIndex.toString(), pageSize: pageSize.toString(), search: searchText };
    return this.http.get(this.apiUrl + 'reels/details', { headers: this.headers, params });
  }
  getReelById(id: string): Observable<any> {
    return this.http.get(this.apiUrl + 'reels/get/' + id, { headers: this.headers });
  }

  likeReel(model: any): Observable<any> {
    const body = model;
    return this.http.post(this.apiUrl + 'reellike/like', body, { headers: this.headers });
  }


  viewReel(): Observable<any> {
    return this.http.post(`${this.apiUrl}reelview/view`, {
      headers: this.headers
    });
  }


  movieReaction(movieId: number, status: number): Observable<any> {
    return this.http.post(`${this.apiUrl}movie/movieReaction/${movieId}`, { status }, {
      headers: this.headers
    });
}

viewVideo(model: any): Observable<any> {
  return this.http.post(this.apiUrl + 'video/videoview', model, {
    headers: this.headers
  });
}

}
