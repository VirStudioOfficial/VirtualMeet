"use client";

import { FormEvent, useState } from "react";

interface LoginFormProps {
  onLogin: (data: {
    email: string;
    password: string;
  }) => void;
}

export default function LoginForm({
  onLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("لطفاً ایمیل و رمز عبور را وارد کنید.");
      return;
    }

    try {
      onLogin({
        email: email.trim(),
        password,
      });
    } catch {
      setError("ورود انجام نشد. دوباره تلاش کنید.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-gray-900 p-6"
    >
      <div>
        <label
          htmlFor="login-email"
          className="mb-2 block text-sm text-gray-300"
        >
          ایمیل
        </label>

        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label
          htmlFor="login-password"
          className="mb-2 block text-sm text-gray-300"
        >
          رمز عبور
        </label>

        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="رمز عبور"
          autoComplete="current-password"
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      {error && (
        <div className="rounded-xl bg-red-900/30 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700"
      >
        ورود
      </button>
    </form>
  );
}
