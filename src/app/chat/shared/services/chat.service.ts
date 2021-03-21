import { Injectable } from '@angular/core';
import { SocketChat } from '../../../app.module';
import { Observable } from 'rxjs';
import {ChatClient} from '../models/chat-client.model';
import {ChatMessage} from '../models/chat-message.model';
import {WelcomeDto} from '../dtos/welcome.dto';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  chatClient: ChatClient | undefined;

  constructor(private socketChat: SocketChat) { }

  sendMessage(msg: string): void{
    this.socketChat.emit('message', msg);
  }

  sendTyping(typing: boolean): void {
    this.socketChat.emit('typing', typing );
  }

  listenForMessages(): Observable<ChatMessage>{
    return this.socketChat
      .fromEvent<ChatMessage>('newMessage');
  }

  getAllMessages(): Observable<ChatMessage[]>{
    return this.socketChat
      .fromEvent<ChatMessage[]>('allMessages');
  }

  listenForClients(): Observable<ChatClient[]>{
    return this.socketChat
      .fromEvent<ChatClient[]>('clients');
  }

  listenForWelcome(): Observable<WelcomeDto>{
    return this.socketChat
      .fromEvent<WelcomeDto>('welcome');
  }

  listenForClientTyping(): Observable<ChatClient>{
    return this.socketChat
      .fromEvent<ChatClient>('clientTyping');
  }

  listenForErrors(): Observable<string>{
    return this.socketChat
      .fromEvent<string>('error');
  }

  listenForConnect(): Observable<string>{
    return this.socketChat
      .fromEvent<string>('connect')
      .pipe(map( () =>
        {
          return this.socketChat.ioSocket.id;
        })
      );
  }

  listenForDisconnect(): Observable<string>{
    return this.socketChat
      .fromEvent<string>('disconnect')
      .pipe(map( () =>
      {
        return this.socketChat.ioSocket.id;
      })
      );
  }

  sendNickname(nickname: string): void {
      this.socketChat.emit('nickname', nickname);
  }

  disconnect(): void {
    this.socketChat.disconnect();
  }

  connect(): void {
    this.socketChat.connect();
  }

}
