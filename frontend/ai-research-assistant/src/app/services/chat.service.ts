import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  createSession() {
    return this.http.post<any>(`${this.apiUrl}/sessions`, {});
  }

  getSessions() {
    return this.http.get<any[]>(`${this.apiUrl}/sessions`);
  }

  getMessages(sessionId: string) {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/${sessionId}/messages`);
  }

  sendMessage(sessionId: string, message: string) {
    return this.http.post<any>(`${this.apiUrl}/chat`, {
      sessionId,
      message
    });
  }

}
