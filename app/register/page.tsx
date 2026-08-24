"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import RegisterForm from "../../components/auth/RegisterForm";
import { register } from "../../services/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  function handleRegister(data: {
    username: string;
    email: string;
    password: string;
  }) {
    setError("");

    const user = register(data);

    if (!user) {
      setError(
        "این ایمیل قبلاً ثبت شده است."
      );
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
            حساب خودت رو بساز و وارد جلسه شو
          </p>
        </div>

        <RegisterForm
          onRegister={handleRegister}
        />

        {error && (
          <div className="mt-4 rounded-xl bg-red-900/30 p-3 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="mt-5 text-center text-sm text-gray-400">
          قبلاً حساب ساختی؟

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mr-2 text-blue-400 hover:text-blue-300"
          >
            ورود
          </button>
        </div>
      </div>
    </main>
  );
}
