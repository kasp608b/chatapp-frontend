import {ChatClient} from '../models/chat-client.model';

export class ListenForClients {
  static readonly type = '[chat] Listen for clients';
}

export class StopListeningForClients {
  static readonly type = '[chat] Stop listening for clients';
}

export class UpdateClients {
  constructor(public clients: ChatClient[]) {}

  static readonly type = '[chat] Update clients';

}


