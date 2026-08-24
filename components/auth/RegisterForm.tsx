"use client";

import { FormEvent, useState } from "react";

interface RegisterFormProps {
  onRegister: (data: {
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
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [error, setError] = useState("");

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (
      !username.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("لطفاً تمام فیلدها را پر کنید.");
      return;
    }

    if (password.length < 6) {
      setError(
        "رمز عبور باید حداقل ۶ کاراکتر باشد."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("رمزهای عبور با هم مطابقت ندارند.");
      return;
    }

    try {
      onRegister({
        username: username.trim(),
        email: email.trim(),
        password,
      });
    } catch {
      setError(
        "ثبت‌نام انجام نشد. دوباره تلاش کنید."
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl bg-gray-900 p-6"
    >
      <div>
        <label
          htmlFor="register-username"
          className="mb-2 block text-sm text-gray-300"
        >
          نام کاربری
        </label>

        <input
          id="register-username"
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          placeholder="نام کاربری"
          autoComplete="username"
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label
          htmlFor="register-email"
          className="mb-2 block text-sm text-gray-300"
        >
          ایمیل
        </label>

        <input
          id="register-email"
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
          htmlFor="register-password"
          className="mb-2 block text-sm text-gray-300"
        >
          رمز عبور
        </label>

        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(event) =>
            setPassword(event.target.value)
          }
          placeholder="حداقل ۶ کاراکتر"
          autoComplete="new-password"
          className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />
      </div>

      <div>
        <label
          htmlFor="register-confirm-password"
          className="mb-2 block text-sm text-gray-300"
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
        ثبت‌نام
      </button>
    </form>
  );
}
