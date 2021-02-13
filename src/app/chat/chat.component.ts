import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './shared/chat.service';
import {Observable, Subject, Subscription} from 'rxjs';
import { ChatClient } from './shared/chat-client.model';
import {ChatMessage} from './shared/chat-message.model';
import {debounceTime, take, takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  messageFC = new FormControl('');
  nicknameFC = new FormControl('');
  messages: ChatMessage[] = [];
  clientsTyping: ChatClient[] = [];
  errorMessage: string | undefined;
  clients$: Observable<ChatClient[]> | undefined;
  unsubscriber$ = new Subject();
  chatClient: ChatClient | undefined;
  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.messageFC.valueChanges
      .pipe(
        takeUntil(this.unsubscriber$),
        debounceTime(500)
      ).subscribe((value) => {
        this.chatService.sendTyping(value.length > 0);
    });

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

    this.chatService.listenForClientTyping()
      .pipe(takeUntil(this.unsubscriber$))
      .subscribe((chatClient) => {
        if (chatClient.typing && !this.clientsTyping.find((c) => c.id === chatClient.id)){
         this.clientsTyping.push(chatClient);
        } else {
          this.clientsTyping = this.clientsTyping.filter((c) => c.id !== chatClient.id);
        }
      });
  }

  sendMessage(): void {
    console.log(this.messageFC.value);
    this.chatService.sendMessage(this.messageFC.value);
    this.messageFC.patchValue('');
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
