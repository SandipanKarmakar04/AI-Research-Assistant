import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {

  @Output() selectChat = new EventEmitter<string>();
  sessions: any[] = [];

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    this.loadSessions();
  }

  // 🔵 Load sessions from backend
  loadSessions() {
    this.chatService.getSessions().subscribe(res => {
      this.sessions = res;

      this.sessions.sort((a: any, b: any) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime()

      
    );
    });
  }

  // 🟢 FIXED: Create new chat session
  newChat() {
    this.chatService.createSession().subscribe(res => {

      // refresh sidebar list
      this.loadSessions();

      // auto open new chat in main UI
      this.selectChat.emit(res.sessionId);
    });
  }

  // 🟡 Open existing chat
  openChat(id: string) {
    console.log("CLICKED SESSION:", id);
    this.selectChat.emit(id);
  }
}