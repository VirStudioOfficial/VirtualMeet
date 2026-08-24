export interface Message {
  id: string;
  meetingId: string;
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}

const MESSAGES_KEY = "virtual-meet-messages";

function getMessages(): Message[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(MESSAGES_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Message[];
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

export function getMessagesByMeeting(
  meetingId: string
): Message[] {
  return getMessages()
    .filter((message) => message.meetingId === meetingId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() -
        new Date(b.createdAt).getTime()
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

export function createMessage(data: {
  meetingId: string;
  userId: string;
  username: string;
  message: string;
}): Message | null {
  const text = data.message.trim();

  if (!text) {
    return null;
  }

  const messages = getMessages();

  const newMessage: Message = {
    id: crypto.randomUUID(),
    meetingId: data.meetingId,
    userId: data.userId,
    username: data.username,
    message: text.slice(0, 1000),
    createdAt: new Date().toISOString(),
  };

  messages.push(newMessage);
  saveMessages(messages);

  return newMessage;
}

export function deleteMessage(
  id: string,
  userId: string
): boolean {
  const messages = getMessages();

  const message = messages.find(
    (item) => item.id === id
  );

  if (!message || message.userId !== userId) {
    return false;
  }

  const filteredMessages = messages.filter(
    (item) => item.id !== id
  );

  saveMessages(filteredMessages);

  return true;
}

export function clearMeetingMessages(
  meetingId: string
): number {
  const messages = getMessages();

  const remainingMessages = messages.filter(
    (message) => message.meetingId !== meetingId
  );

  saveMessages(remainingMessages);

  return messages.length - remainingMessages.length;
}
