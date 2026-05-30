import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { UploadComponent } from '../upload/upload.component';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, UploadComponent],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent implements OnInit, OnChanges {

  @Input() sessionId: string | null = null;

  messages: any[] = [];
  userInput = '';

  constructor(private chatService: ChatService) {}

  ngOnInit() {
    // ✅ FIX: don't restore from localStorage on refresh
    // always start fresh — sessionId only comes from @Input
    localStorage.removeItem('currentSessionId');
  }

ngOnChanges(changes: SimpleChanges) {
  const change = changes['sessionId'];

  if (!change || change.firstChange) return;

  if (!this.sessionId || this.sessionId === '') { // ✅ catch both null and ''
    this.messages = [];
    this.sessionId = null;
    localStorage.removeItem('currentSessionId');
    return;
  }

  this.loadMessages();
}

  loadMessages() {
    if (!this.sessionId) return;

    this.chatService.getMessages(this.sessionId).subscribe(res => {
      this.messages = res.map((m: any) => ({
        role: m.role,
        text: m.content
      }));
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;

    const msg = this.userInput;

    if (!this.sessionId) {
      this.chatService.createSession().subscribe(res => {
        this.sessionId = res.sessionId;
        localStorage.setItem('currentSessionId', this.sessionId!);
        window.dispatchEvent(new Event('session-created'));
        this.sendToBackend(msg);
      });
      return;
    }

    this.sendToBackend(msg);
  }

  sendToBackend(msg: string) {
    this.messages.push({ role: 'user', text: msg });
    this.userInput = '';
    this.messages.push({ role: 'assistant', text: 'Typing...' });

    this.chatService.sendMessage(this.sessionId!, msg).subscribe({
      next: (res) => {
        this.messages.pop();
        this.messages.push({ role: 'assistant', text: res.reply });
      },
      error: () => {
        this.messages.pop();
        this.messages.push({ role: 'assistant', text: 'Server error' });
      }
    });
  }
}