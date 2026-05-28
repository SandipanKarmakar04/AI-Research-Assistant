import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { UploadComponent } from './components/upload/upload.component';
import { ChatComponent } from './components/chat/chat.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, UploadComponent, ChatComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  selectedSessionId: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.createNewSession();
  }

  createNewSession() {
    this.http.post<any>('http://127.0.0.1:8000/sessions', {})
      .subscribe({
        next: (res) => {
          console.log("NEW SESSION CREATED:", res.sessionId);
          this.selectedSessionId = res.sessionId;
        },
        error: (err) => {
          console.error("SESSION CREATE FAILED:", err);
        }
      });
  }

  onSessionSelect(id: string) {
    console.log("SESSION SELECTED:", id);
    this.selectedSessionId = id;
  }
  
}
