import { useCallback, useEffect, useState } from "react";

import {
  getCurrentUser,
  isAuthenticated,
  login,
  logout,
  register,
  LoginData,
  RegisterData,
} from "../services/auth";
import { User } from "../types/user";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getCurrentUser());
    setLoading(false);
  }, []);

  const handleRegister = useCallback((data: RegisterData) => {
    setError("");

    try {
      const newUser = register(data);
      setUser(newUser);
      return newUser;
    } catch {
      setError("ثبت‌نام با مشکل مواجه شد.");
      return null;
    }
  }, []);

  const handleLogin = useCallback((data: LoginData) => {
    setError("");

    const loggedInUser = login(data);

    if (!loggedInUser) {
      setError("ایمیل یا رمز عبور اشتباه است.");
      return null;
    }

    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    setUser(null);
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: isAuthenticated(),
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
}
