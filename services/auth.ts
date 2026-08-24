import {
  createUser,
  getUserByEmail,
} from "../database/users";

import { User } from "../types/user";

const CURRENT_USER_KEY = "virtual-meet-user";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface StoredUser extends User {
  password: string;
}

function getCurrentUserFromStorage(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(
    CURRENT_USER_KEY
  );

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(CURRENT_USER_KEY);
    return null;
  }
}

function saveCurrentUser(user: User): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify(user)
  );
}

export function getCurrentUser(): User | null {
  return getCurrentUserFromStorage();
}

export function isAuthenticated(): boolean {
  return getCurrentUserFromStorage() !== null;
}

export function register(
  data: RegisterData
): User | null {
  const username = data.username.trim();
  const email = data.email.trim().toLowerCase();
  const password = data.password;

  if (!username || !email || !password) {
    return null;
  }

  if (password.length < 6) {
    return null;
  }

  const existingUser = getUserByEmail(email);

  if (existingUser) {
    return null;
  }

  const user: User = {
    id: crypto.randomUUID(),
    username,
    email,
    isMuted: false,
    isCameraOff: false,
  };

  const createdUser = createUser(
    user,
    password
  );

  saveCurrentUser(createdUser);

  return createdUser;
}

export function login(
  data: LoginData
): User | null {
  const email = data.email.trim().toLowerCase();
  const password = data.password;

  if (!email || !password) {
    return null;
  }

  const storedUser = getStoredUserByEmail(email);

  if (!storedUser) {
    return null;
  }

  if (storedUser.password !== password) {
    return null;
  }

  const {
    password: _password,
    ...safeUser
  } = storedUser;

  saveCurrentUser(safeUser);

  return safeUser;
}

export function logout(): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.removeItem(CURRENT_USER_KEY);
}

function getStoredUserByEmail(
  email: string
): StoredUser | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(
    "virtual-meet-users"
  );

  if (!stored) {
    return null;
  }

  try {
    const users = JSON.parse(
      stored
    ) as StoredUser[];

    return (
      users.find(
        (user) =>
          user.email.toLowerCase() === email
      ) ?? null
    );
  } catch {
    return null;
  }
}
