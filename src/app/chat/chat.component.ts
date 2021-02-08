import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './shared/chat.service';
import {Observable, Subject, Subscription} from 'rxjs';
import { ChatClient } from './shared/chat-client.model';
import {ChatMessage} from './shared/chat-message.model';
import {take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageFC = new FormControl('');
  nicknameFC = new FormControl('');
  messages: ChatMessage[] = [];
  clients$: Observable<ChatClient[]> | undefined;
  unsubscriber$ = new Subject();
  nickname: string | undefined;
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.listenForMessages()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(message => {
        console.log('hello');
        this.messages.push(message);
      });
    this.clients$ = this.chatService.listenForClients();
    this.chatService.getAllMessages()
      .pipe(
        take(1)
      )
      .subscribe(messages => {
        console.log('hello');
        this.messages = messages;
      });

    this.chatService.connect();
  }

  sendMessage(): void {
    console.log(this.messageFC.value);
    this.chatService.sendMessage(this.messageFC.value);
  }

  ngOnDestroy(): void {
    console.log('Destroyed');
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
    this.chatService.disconnect();
  }

  sendNickname(): void {
    // Remember to validate name
    this.nickname = this.nicknameFC.value;
    if (this.nickname){
      this.chatService.sendNickname(this.nickname);
    }
  }
}
