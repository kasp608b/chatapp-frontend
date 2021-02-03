import {Component, OnDestroy, OnInit} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ChatService } from './shared/chat.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit, OnDestroy {
  message = new FormControl('');
  nameFC = new FormControl('');
  messages: string[] = [];
  clients: string[] = [];
  private sub: Subscription | undefined;
  private sub2: Subscription | undefined;
  name: string | undefined;
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
    console.log(this.message.value);
    this.chatService.sendMessage(this.message.value);
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

  sendName(): void {
    // Remember to validate name
    this.name = this.nameFC.value;
    if (this.name){
      this.chatService.sendName(this.name);
    }
  }
}
