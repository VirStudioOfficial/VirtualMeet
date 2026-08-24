export interface RoomUser {
  socketId: string;
  id: string;
  username: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

export interface ChatMessagePayload {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}
