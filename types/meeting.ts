export interface Meeting {
  id: string;
  roomId: string;
  hostId: string;
  title?: string;
  createdAt: Date;
  endedAt?: Date;
  participants: string[];
  isRecording?: boolean;
}
