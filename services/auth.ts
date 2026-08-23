import { User } from "../types/user";

const USER_KEY = "virtual-meet-user";
const TOKEN_KEY = "virtual-meet-token";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedUser = localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function register(data: RegisterData): User {
  const user: User = {
    id: crypto.randomUUID(),
    username: data.username,
    email: data.email,
    isHost: false,
    isMuted: false,
    isCameraOff: false,
  };

  localStorage.setItem(USER_KEY, JSON.stringify(user));

  const token = crypto.randomUUID();
  localStorage.setItem(TOKEN_KEY, token);

  return user;
}

export function login(data: LoginData): User | null {
  const storedUser = getCurrentUser();

  if (!storedUser) {
    return null;
  }

  if (storedUser.email !== data.email) {
    return null;
  }

  localStorage.setItem(
    TOKEN_KEY,
    crypto.randomUUID()
  );

  return storedUser;
}

export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return Boolean(
    localStorage.getItem(USER_KEY) &&
    localStorage.getItem(TOKEN_KEY)
  );
}

export function getToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(TOKEN_KEY);
}
