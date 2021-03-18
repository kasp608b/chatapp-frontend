import {ChatMessage} from './chat-message.model';

export interface ChatClient {
  id: string;
  nickName: string;
  typing: boolean | undefined;
}
