export interface ServerToClientEvents {
  'room:message':   (msg: RoomMessage) => void;
  'room:joined':    (info: { roomId: string }) => void;
  'room:left':      (info: { roomId: string }) => void;
  'error':          (err: { code: string; message: string }) => void;
}

export interface ClientToServerEvents {
  'join-room':      (roomId: string, cb: (res: AckResponse) => void) => void;
  'leave-room':     (roomId: string) => void;
  'send-message':   (payload: SendMessagePayload, cb: (res: AckResponse) => void) => void;
}

export interface SocketData {
  userId: string;
  roles:  string[];
}

export interface RoomMessage {
  id:        string;
  roomId:    string;
  senderId:  string;
  content:   string;
  createdAt: string;
}

export interface SendMessagePayload {
  roomId:  string;
  content: string;
}

export type AckResponse =
  | { ok: true }
  | { ok: false; code: string };