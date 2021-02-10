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
  errorMessage: string | undefined;
  clients$: Observable<ChatClient[]> | undefined;
  unsubscriber$ = new Subject();
  chatClient: ChatClient | undefined;
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.clients$ = this.chatService.listenForClients();

    this.chatService.listenForErrors()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(error => {
        console.log('error');
        this.errorMessage = error;
      });

    this.chatService.listenForMessages()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe(message => {
        console.log('hello');
        this.messages.push(message);
      });

    this.chatService.listenForWelcome().pipe(
      takeUntil(this.unsubscriber$)
    )
      .subscribe(welcome => {
        this.messages = welcome.messages;
        this.chatClient = this.chatService.chatClient = welcome.client;
        this.errorMessage = undefined;
      });

    if (this.chatService.chatClient){
      this.chatService.sendNickname(this.chatService.chatClient.nickName);
    }
  }

  sendMessage(): void {
    console.log(this.messageFC.value);
    this.chatService.sendMessage(this.messageFC.value);
  }

  ngOnDestroy(): void {
    console.log('Destroyed');
    this.unsubscriber$.next();
    this.unsubscriber$.complete();
  }

  sendNickname(): void {
    if (this.nicknameFC.value){
      this.chatService.sendNickname(this.nicknameFC.value);
    }
  }
}
