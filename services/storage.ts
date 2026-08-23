const PREFIX = "virtual-meet:";

function getKey(key: string) {
  return `${PREFIX}${key}`;
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    getKey(key),
    JSON.stringify(value)
  );
}

export function getItem<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const value = localStorage.getItem(getKey(key));

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function removeItem(key: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(getKey(key));
}

export function clearStorage(): void {
  if (typeof window === "undefined") return;

  Object.keys(localStorage)
    .filter((key) => key.startsWith(PREFIX))
    .forEach((key) => localStorage.removeItem(key));
}

export function hasItem(key: string): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return localStorage.getItem(getKey(key)) !== null;
}
