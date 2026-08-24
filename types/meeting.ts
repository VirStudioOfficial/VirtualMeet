export interface Meeting {
  id: string;
  roomId: string;
  title: string;
  hostId: string;
  participants: string[];
  createdAt: Date;
  isActive: boolean;
}
