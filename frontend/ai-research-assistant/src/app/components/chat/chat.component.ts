import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
export class ChatComponent {

  constructor(private chatService: ChatService) { }
  userInput = '';
  messages = [
    {
      role: 'user',
      text: 'Hello AI'
    },
    {
      role: 'assistant',
      text: 'Hello! How can I help you?'
    }
  ];

  sendMessage() {

  if (!this.userInput.trim()) return;

  const question = this.userInput;

  // User message
  this.messages.push({
    role: 'user',
    text: question
  });

  this.userInput = '';

  // AI loading message
  this.messages.push({
    role: 'assistant',
    text: 'Typing...'
  });

  this.chatService.askQuestion(question)
    .subscribe({

      next: (res: any) => {

        // remove typing
        this.messages.pop();

        // add real AI response
        this.messages.push({
          role: 'assistant',
          text: res.answer
        });

      },

      error: (err) => {

        this.messages.pop();

        this.messages.push({
          role: 'assistant',
          text: 'Server error'
        });

        console.error(err);

      }

    });

}


}
