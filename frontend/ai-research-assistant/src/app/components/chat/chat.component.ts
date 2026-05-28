import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
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
export class ChatComponent implements OnChanges {

  @Input() sessionId: string | null = null;

  messages: any[] = [];
  userInput = '';

  constructor(private chatService: ChatService) { }

  // 🔵 LOAD MESSAGES WHEN SESSION CHANGES
  ngOnChanges() {

    console.log("INPUT SESSION ID CHANGED:", this.sessionId);

    if (!this.sessionId) return;

    this.loadMessages();
  }

  // 🧠 LOAD CHAT HISTORY
  loadMessages() {

    if (!this.sessionId) return;

    this.chatService.getMessages(this.sessionId)
      .subscribe(res => {

        this.messages = res.map((m: any) => ({
          role: m.role,
          text: m.content
        }));

      });
  }


  // 🟢 SEND MESSAGE (NEW CHATGPT STYLE LOGIC)
  sendMessage() {

    console.log("SEND CLICKED");
    console.log("SESSION ID:", this.sessionId);
    console.log("MESSAGE:", this.userInput);

    if (!this.userInput.trim()) return;

    const msg = this.userInput;

    // 🧠 IF NO SESSION → CREATE FIRST
    if (!this.sessionId) {

      this.messages.push({
        role: 'user',
        text: msg
      });

      this.userInput = '';

      this.messages.push({
        role: 'assistant',
        text: 'Creating session...'
      });

      this.chatService.createSession().subscribe(res => {

        this.sessionId = res.sessionId;

        console.log("NEW SESSION CREATED:", this.sessionId);

        this.messages.pop(); // remove "Creating session..."

        this.sendToBackend(msg);

      });

      return;
    }

    // 🟢 NORMAL FLOW
    this.sendToBackend(msg);
  }

  // 🚀 ACTUAL MESSAGE SENDER
  sendToBackend(msg: string) {

    // user message
    this.messages.push({
      role: 'user',
      text: msg
    });

    this.userInput = '';

    // typing indicator
    this.messages.push({
      role: 'assistant',
      text: 'Typing...'
    });

    this.chatService.sendMessage(this.sessionId!, msg)
      .subscribe({

        next: (res) => {

          this.messages.pop();

          this.messages.push({
            role: 'assistant',
            text: res.reply
          });

          // 🔥 refresh sidebar titles
          // setTimeout(() => {
          //   window.location.reload();
          // }, 300);

        },

        error: (err) => {

          console.error("CHAT ERROR:", err);

          this.messages.pop();

          this.messages.push({
            role: 'assistant',
            text: 'Server error'
          });

        }

      });
  }
}