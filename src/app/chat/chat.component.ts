import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './shared/services/chat.service';
import { Observable, Subject, Subscription } from 'rxjs';
import { ChatClient } from './shared/models/chat-client.model';
import { ChatMessage } from './shared/models/chat-message.model';
import { debounceTime, take, takeUntil } from 'rxjs/operators';
import { ChatState } from './shared/state/chat.state';
import { Select, Store} from '@ngxs/store';
import {ListenForClients, StopListeningForClients} from './shared/state/chat.actions';

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
  @Select(ChatState.clients)
  clients$: Observable<ChatClient[]> | undefined;
  unsubscriber$ = new Subject();
  chatClient: ChatClient | undefined;
  socketId: string | undefined;
  constructor(private chatService: ChatService, private store: Store, ) { }

  ngOnInit(): void {
    this.store.dispatch(new ListenForClients());
    this.messageFC.valueChanges
      .pipe(
        takeUntil(this.unsubscriber$),
        debounceTime(500)
      ).subscribe((value) => {
        this.chatService.sendTyping(value.length > 0);
    });

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
        } else if (!chatClient.typing && this.clientsTyping.find((c) => c.id === chatClient.id))
          {
          this.clientsTyping = this.clientsTyping.filter((c) => c.id !== chatClient.id);
        }
      });
    this.chatService.listenForConnect()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((id) => {
        this.socketId = id;
      });

    this.chatService.listenForDisconnect()
      .pipe(
        takeUntil(this.unsubscriber$)
      )
      .subscribe((id) => {
        this.socketId = id;
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
    this.store.dispatch(new StopListeningForClients());
  }

  sendNickname(): void {
    if (this.nicknameFC.value){
      this.chatService.sendNickname(this.nicknameFC.value);
    }
  }
}
