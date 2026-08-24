export interface Meeting {
  id: string;

  roomId: string;

  title: string;

  hostId: string;

  participants: string[];

  isActive: boolean;

  createdAt: string;
}
