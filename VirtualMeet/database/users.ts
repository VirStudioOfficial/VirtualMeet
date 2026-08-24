import { User } from "../types/user";

const USERS_KEY = "virtual-meet-users";

function getUsers(): User[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(USERS_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as User[];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function getUserById(id: string): User | null {
  return (
    getUsers().find((user) => user.id === id) ?? null
  );
}

export function getUserByEmail(
  email: string
): User | null {
  return (
    getUsers().find(
      (user) => user.email === email
    ) ?? null
  );
}

export function createUser(user: User): User {
  const users = getUsers();

  const exists = users.some(
    (item) => item.id === user.id
  );

  if (exists) {
    return user;
  }

  users.push(user);
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

  return users[index];
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
