import { User } from "./user";

export interface Room {
  id: string;
  hostId: string;
  participants: User[];
  createdAt: Date;
  isLocked?: boolean;
  password?: string;
}
