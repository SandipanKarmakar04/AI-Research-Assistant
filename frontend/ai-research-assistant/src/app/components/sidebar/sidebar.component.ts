import { Component, EventEmitter, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit, OnDestroy {

  @Output() selectChat = new EventEmitter<string>();
  sessions: any[] = [];
  activeSessionId: string | null = null;

  private sessionListener = () => this.loadSessions();

  constructor(private chatService: ChatService, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.activeSessionId = localStorage.getItem('currentSessionId');
    this.loadSessions();
    window.addEventListener('session-created', this.sessionListener);
  }

  ngOnDestroy() {
    window.removeEventListener('session-created', this.sessionListener);
  }

  loadSessions() {
    this.chatService.getSessions().subscribe(res => {
      this.sessions = res.sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    });
  }

  newChat() {
    localStorage.removeItem('currentSessionId');
    this.selectChat.emit(null as any);
  }

  openChat(id: string) {
    localStorage.setItem('currentSessionId', id);
    this.activeSessionId = id;
    this.cdr.detectChanges();
    this.selectChat.emit(id);
  }
}