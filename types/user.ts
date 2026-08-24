export interface User {
  id: string;

  username: string;

  email: string;

  avatar?: string;

  bio?: string;

  isMuted: boolean;

  isCameraOff: boolean;

  createdAt?: string;
}
