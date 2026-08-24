"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  register,
} from "../services/auth";

import { User } from "../types/user";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(() => {
    const currentUser = getCurrentUser();

    setUser(currentUser);
    setLoading(false);

    return currentUser;
  }, []);

  useEffect(() => {
    refreshUser();

    function handleStorageChange() {
      refreshUser();
    }

    window.addEventListener(
      "storage",
      handleStorageChange
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorageChange
      );
    };
  }, [refreshUser]);

  const handleLogin = useCallback(
    (data: LoginData) => {
      const loggedInUser = login(data);

      if (!loggedInUser) {
        return null;
      }

      setUser(loggedInUser);

      return loggedInUser;
    },
    []
  );

  const handleRegister = useCallback(
    (data: RegisterData) => {
      const registeredUser = register(data);

      if (!registeredUser) {
        return null;
      }

      setUser(registeredUser);

      return registeredUser;
    },
    []
  );

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: isAuthenticated(),
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser,
  };
}
