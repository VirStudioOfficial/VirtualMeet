"use client";

import { FormEvent, useState } from "react";

interface LoginFormProps {
  onLogin?: (data: {
    email: string;
    password: string;
  }) => void;
}

export default function LoginForm({
  onLogin,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      return;
    }

    onLogin?.({
      email: email.trim(),
      password,
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-5 rounded-2xl bg-gray-900 p-6 text-white shadow-xl"
    >
      <div>
        <h2 className="text-2xl font-bold">
          ورود به Virtual Meet
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          وارد حساب کاربری خود شوید
        </p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-email"
          className="text-sm text-gray-300"
        >
          ایمیل
        </label>

        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="example@email.com"
          autoComplete="email"
          required
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="login-password"
          className="text-sm text-gray-300"
        >
          رمز عبور
        </label>

        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="رمز عبور"
          autoComplete="current-password"
          required
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        ورود
      </button>
    </form>
  );
}
