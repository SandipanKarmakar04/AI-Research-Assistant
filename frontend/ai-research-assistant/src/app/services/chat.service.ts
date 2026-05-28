import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://127.0.0.1:8000/ask';

  constructor(private httpClient: HttpClient) {}

  askQuestion(question: string) {

    return this.httpClient.post<any>(this.apiUrl, {
      question: question
    });

  }
}
