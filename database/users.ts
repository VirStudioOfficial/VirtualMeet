import { User } from "../types/user";

const USERS_KEY = "virtual-meet-users";

interface StoredUser extends User {
  password: string;
}

function getUsers(): StoredUser[] {
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

function saveUsers(users: StoredUser[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(users)
  );
}

export function getAllUsers(): User[] {
  return getUsers().map(
    ({ password: _password, ...user }) => user
  );
}

export function getUserById(
  id: string
): User | null {
  const user = getUsers().find(
    (item) => item.id === id
  );

  if (!user) {
    return null;
  }

  const { password: _password, ...safeUser } = user;

  return safeUser;
}

export function getUserByEmail(
  email: string
): User | null {
  const user = getUsers().find(
    (item) =>
      item.email.toLowerCase() ===
      email.toLowerCase()
  );

  if (!user) {
    return null;
  }

  const { password: _password, ...safeUser } = user;

  return safeUser;
}

export function createUser(
  user: User,
  password = ""
): User {
  const users = getUsers();

  const existing = users.find(
    (item) =>
      item.id === user.id ||
      item.email.toLowerCase() ===
        user.email.toLowerCase()
  );

  if (existing) {
    const {
      password: _password,
      ...safeUser
    } = existing;

    return safeUser;
  }

  const storedUser: StoredUser = {
    ...user,
    password,
  };

  users.push(storedUser);
  saveUsers(users);

  return user;
}

export function updateUser(
  id: string,
  updates: Partial<User>
): User | null {
  const users = getUsers();

  const index = users.findIndex(
    (user) => user.id === id
  );

  if (index === -1) {
    return null;
  }

  users[index] = {
    ...users[index],
    ...updates,
  };

  saveUsers(users);

  const {
    password: _password,
    ...safeUser
  } = users[index];

  return safeUser;
}

export function deleteUser(id: string): boolean {
  const users = getUsers();

  const filtered = users.filter(
    (user) => user.id !== id
  );

  if (filtered.length === users.length) {
    return false;
  }

  saveUsers(filtered);

  return true;
}
