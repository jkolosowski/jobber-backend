import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export type SocketDefault = Socket<
  DefaultEventsMap,
  DefaultEventsMap,
  DefaultEventsMap,
  any
>;

export interface ChatMessage {
  senderId: string;
  receiverId: string;
  message: string;
}

export interface ChatMessageAck {
  messageId: string;
}
