import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private apiUrl = 'http://127.0.0.1:8000/upload';

  constructor(private httpClient: HttpClient) { }

  uploadFile(file: File) {

    const formData = new FormData();

    formData.append('file', file);

    return this.httpClient.post<any>(this.apiUrl, formData);

  }
}
