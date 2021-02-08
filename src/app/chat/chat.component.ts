import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './shared/chat.service';
import { Subscription } from 'rxjs';
import { ChatClient } from './shared/chat-client.model';
import {ChatMessage} from './shared/chat-message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageFC = new FormControl('');
  nicknameFC = new FormControl('');
  messages: ChatMessage[] = [];
  clients: ChatClient[] = [];
  private sub: Subscription | undefined;
  private sub2: Subscription | undefined;
  nickname: string | undefined;
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.sub = this.chatService.listenForMessages()
      .subscribe(message => {
        console.log('hello');
        this.messages.push(message);
      });
    this.sub2 = this.chatService.listenForClients()
      .subscribe(clients => {
        this.clients = clients;
      });
  }

  sendMessage(): void {
    console.log(this.messageFC.value);
    this.chatService.sendMessage(this.messageFC.value);
  }

  ngOnDestroy(): void {
    console.log('Destroyed');
    if (this.sub){
      this.sub.unsubscribe();
    }
    if (this.sub2){
      this.sub2.unsubscribe();
    }
  }

  sendNickname(): void {
    // Remember to validate name
    this.nickname = this.nicknameFC.value;
    if (this.nickname){
      this.chatService.sendNickname(this.nickname);
    }
  }
}
