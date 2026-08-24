"use client";

export const storage = {
  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") {
      return;
    }

    try {
      localStorage.setItem(
        key,
        JSON.stringify(value)
      );
    } catch (error) {
      console.error(
        "Storage save error:",
        error
      );
    }
  },

  get<T>(key: string): T | null {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const item = localStorage.getItem(key);

      if (!item) {
        return null;
      }

      return JSON.parse(item) as T;
    } catch (error) {
      console.error(
        "Storage read error:",
        error
      );

      return null;
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem(key);
  },

  clear(): void {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.clear();
  },

  exists(key: string): boolean {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem(key) !== null;
  },

  update<T>(
    key: string,
    updater: (value: T | null) => T
  ): T | null {
    const current = this.get<T>(key);

    const updated = updater(current);

    this.set(key, updated);

    return updated;
  },
};
