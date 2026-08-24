import { User } from "../types/user";

const USER_KEY = "virtual-meet-user";
const TOKEN_KEY = "virtual-meet-token";
const USERS_KEY = "virtual-meet-users";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

interface StoredUser extends User {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as StoredUser[];
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
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

export function register(data: RegisterData): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const users = getStoredUsers();

  const emailExists = users.some(
    (user) =>
      user.email.toLowerCase() ===
      data.email.toLowerCase()
  );

  if (emailExists) {
    return null;
  }

  const user: User = {
    id: crypto.randomUUID(),
    username: data.username.trim(),
    email: data.email.trim().toLowerCase(),
    isHost: false,
    isMuted: false,
    isCameraOff: false,
  };

  const storedUser: StoredUser = {
    ...user,
    password: data.password,
  };

  users.push(storedUser);
  saveStoredUsers(users);

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );

  localStorage.setItem(
    TOKEN_KEY,
    crypto.randomUUID()
  );

  return user;
}

export function login(
  data: LoginData
): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const users = getStoredUsers();

  const user = users.find(
    (item) =>
      item.email.toLowerCase() ===
        data.email.trim().toLowerCase() &&
      item.password === data.password
  );

  if (!user) {
    return null;
  }

  const { password: _password, ...safeUser } = user;

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(safeUser)
  );

  localStorage.setItem(
    TOKEN_KEY,
    crypto.randomUUID()
  );

  return safeUser;
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
