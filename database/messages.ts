import { Message } from "../types/message";

const MESSAGES_KEY = "virtual-meet-messages";

type StoredMessage = Omit<Message, "createdAt"> & {
  createdAt: string;
};

function getMessages(): Message[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(MESSAGES_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsed = JSON.parse(stored) as StoredMessage[];

    return parsed.map((message) => ({
      ...message,
      createdAt: new Date(message.createdAt),
    }));
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    MESSAGES_KEY,
    JSON.stringify(messages)
  );
}

export function getAllMessages(): Message[] {
  return getMessages();
}

export function getMessagesByRoom(
  roomId: string
): Message[] {
  return getMessages().filter(
    (message) => message.roomId === roomId
  );
}

export function getMessageById(
  id: string
): Message | null {
  return (
    getMessages().find(
      (message) => message.id === id
    ) ?? null
  );
}

export function createMessage(
  message: Message
): Message {
  const messages = getMessages();

  const existing = messages.find(
    (item) => item.id === message.id
  );

  if (existing) {
    return existing;
  }

  messages.push(message);
  saveMessages(messages);

  return message;
}

export function deleteMessage(id: string): boolean {
  const messages = getMessages();

  const filtered = messages.filter(
    (message) => message.id !== id
  );

  if (filtered.length === messages.length) {
    return false;
  }

  saveMessages(filtered);

  return true;
}

export function deleteRoomMessages(
  roomId: string
): number {
  const messages = getMessages();

  const filtered = messages.filter(
    (message) => message.roomId !== roomId
  );

  const deletedCount =
    messages.length - filtered.length;

  saveMessages(filtered);

  return deletedCount;
}
