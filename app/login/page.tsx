"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import LoginForm from "../../components/auth/LoginForm";
import { login } from "../../services/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleLogin(data: {
    email: string;
    password: string;
  }) {
    setError("");

    const user = login(data);

    if (!user) {
      setError("ایمیل یا رمز عبور اشتباه است.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold">
            Virtual Meet
          </h1>

          <p className="mt-2 text-gray-400">
            جلسات آنلاین، ساده و سریع
          </p>
        </div>

        <LoginForm onLogin={handleLogin} />

        {error && (
          <div className="mt-4 rounded-xl bg-red-900/30 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-5 text-center text-sm text-gray-400">
          حساب کاربری نداری؟

          <button
            type="button"
            onClick={() => router.push("/register")}
            className="mr-2 text-blue-400 hover:text-blue-300"
          >
            ثبت‌نام
          </button>
        </div>
      </div>
    </main>
  );
}
