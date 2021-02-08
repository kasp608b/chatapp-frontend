import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import {ChatClient} from './chat-client.model';
import {ChatMessage} from './chat-message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private socket: Socket) { }

  sendMessage(msg: string): void{
    this.socket.emit('message', msg);
  }

  listenForMessages(): Observable<ChatMessage>{
    return this.socket
      .fromEvent<ChatMessage>('newMessage');
  }

  listenForClients(): Observable<ChatClient[]>{
    return this.socket
      .fromEvent<any>('clients');
  }

  sendNickname(nickname: string): void {
    this.socket.emit('nickname', nickname);
  }
}
