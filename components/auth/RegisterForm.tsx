"use client";

import { FormEvent, useState } from "react";

interface RegisterFormProps {
  onRegister?: (data: {
    username: string;
    email: string;
    password: string;
  }) => void;
}

export default function RegisterForm({
  onRegister,
}: RegisterFormProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("لطفاً همه فیلدها را کامل کنید.");
      return;
    }

    if (password !== confirmPassword) {
      setError("رمزهای عبور یکسان نیستند.");
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    onRegister?.({
      username: username.trim(),
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
          ساخت حساب Virtual Meet
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          برای شروع یک حساب جدید بسازید
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label
          htmlFor="register-username"
          className="text-sm text-gray-300"
        >
          نام کاربری
        </label>

        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="نام شما"
          autoComplete="username"
          required
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-email"
          className="text-sm text-gray-300"
        >
          ایمیل
        </label>

        <input
          id="register-email"
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
          htmlFor="register-password"
          className="text-sm text-gray-300"
        >
          رمز عبور
        </label>

        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="حداقل ۶ کاراکتر"
          autoComplete="new-password"
          required
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="register-confirm-password"
          className="text-sm text-gray-300"
        >
          تکرار رمز عبور
        </label>

        <input
          id="register-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(event) =>
            setConfirmPassword(event.target.value)
          }
          placeholder="رمز عبور را دوباره وارد کنید"
          autoComplete="new-password"
          required
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700"
      >
        ثبت‌نام
      </button>
    </form>
  );
}
