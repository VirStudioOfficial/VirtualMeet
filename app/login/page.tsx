"use client";

import { useRouter } from "next/navigation";
import LoginForm from "../../components/auth/LoginForm";
import { login } from "../../services/auth";

export default function LoginPage() {
  const router = useRouter();

  function handleLogin(data: {
    email: string;
    password: string;
  }) {
    const user = login(data);

    if (!user) {
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
