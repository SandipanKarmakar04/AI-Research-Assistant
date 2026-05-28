// api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  createSession(): Observable<any> {
    return this.http.post(`${this.baseUrl}/session`, {});
  }

  getSessions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sessions`);
  }

  sendMessage(sessionId: string, message: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/chat`, {
      sessionId,
      message
    });
  }

  getMessages(sessionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/chat/${sessionId}`);
  }
}