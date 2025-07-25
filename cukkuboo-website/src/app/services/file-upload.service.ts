import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpEvent, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  apiUrl: string = environment.apiUrl
  constructor(private http: HttpClient) { }

  get token() { return localStorage.getItem('token') || sessionStorage.getItem('token'); }

  // Set headers including the authorization token
  get headers() {
    return new HttpHeaders({
      // 'Content-Type': 'application/json', // strictly not needed for file uploads
      'Authorization': `Bearer ${this.token}`, // Add Bearer token
    });
  }

  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('video', file);
    // const req = new HttpRequest('POST', this.apiUrl + 'file/upload', formData, {
    //   reportProgress: true,
    //   observe: 'events'
    // });
    return this.http.post(this.apiUrl + 'upload-video', formData, {
      reportProgress: true,
      observe: 'events',
      headers: this.headers
    })
  }
  uploadImage(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('image', file);
    // const req = new HttpRequest('POST', this.apiUrl + 'file/upload', formData, {
    //   reportProgress: true,
    //   observe: 'events'
    // });
    return this.http.post(this.apiUrl + 'support/uploadImage', formData, {
      reportProgress: true,
      observe: 'events',
      headers: this.headers
    })
  }
}
