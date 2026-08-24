export function generateId(length = 8): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  for (let i = 0; i < length; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }

  return result;
}

export function generateRoomId(): string {
  return generateId(8);
}

export function formatDate(
  date: Date | string | number
): string {
  return new Date(date).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatTime(
  date: Date | string | number
): string {
  return new Date(date).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDateTime(
  date: Date | string | number
): string {
  return `${formatDate(date)} - ${formatTime(date)}`;
}

export function truncateText(
  text: string,
  maxLength: number
): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

export function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}
