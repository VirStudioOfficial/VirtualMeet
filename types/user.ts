export interface User {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  isHost?: boolean;
  isMuted?: boolean;
  isCameraOff?: boolean;
}
