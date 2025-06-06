import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  apiUrl: string = environment.apiUrl
  constructor(private http: HttpClient) { }
 
  uploadVideo(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('video', file);
    // const req = new HttpRequest('POST', this.apiUrl + 'file/upload', formData, {
    //   reportProgress: true,
    //   observe: 'events'
    // });
    return this.http.post(this.apiUrl +'upload-video', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
  uploadImage(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('image', file);
    // const req = new HttpRequest('POST', this.apiUrl + 'file/upload', formData, {
    //   reportProgress: true,
    //   observe: 'events'
    // });
    return this.http.post(this.apiUrl +'upload-image', formData, {
      reportProgress: true,
      observe: 'events'
    })
  }
}
