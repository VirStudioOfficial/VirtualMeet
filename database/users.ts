import { User } from "@/types/user";

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "virtual-meet-users";

function getUsers(): StoredUser[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored =
    localStorage.getItem(USERS_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(
      stored
    ) as StoredUser[];
  } catch {
    return [];
  }
}

function saveUsers(
  users: StoredUser[]
): void {
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
    ({ password, ...user }) => user
  );
}

export function getUserById(
  id: string
): User | null {
  const user =
    getUsers().find(
      (item) => item.id === id
    );

  if (!user) {
    return null;
  }

  const {
    password,
    ...safeUser
  } = user;

  return safeUser;
}

export function getUserByEmail(
  email: string
): User | null {
  const user =
    getUsers().find(
      (item) =>
        item.email.toLowerCase() ===
        email.toLowerCase()
    );

  if (!user) {
    return null;
  }

  const {
    password,
    ...safeUser
  } = user;

  return safeUser;
}

export function createUser(
  user: User,
  password: string
): User {
  const users = getUsers();

  const newUser: StoredUser = {
    ...user,
    createdAt:
      user.createdAt ||
      new Date().toISOString(),
    password,
  };

  users.push(newUser);

  saveUsers(users);

  return user;
}

export function updateUser(
  id: string,
  updates: Partial<User>
): User | null {
  const users = getUsers();

  const index =
    users.findIndex(
      (user) =>
        user.id === id
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
    password,
    ...safeUser
  } = users[index];

  return safeUser;
}

export function deleteUser(
  id: string
): boolean {
  const users = getUsers();

  const filtered =
    users.filter(
      (user) =>
        user.id !== id
    );

  if (
    filtered.length === users.length
  ) {
    return false;
  }

  saveUsers(filtered);

  return true;
}
