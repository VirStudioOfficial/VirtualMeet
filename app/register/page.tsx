"use client";

import { useRouter } from "next/navigation";
import RegisterForm from "../../components/auth/RegisterForm";
import { register } from "../../services/auth";

export default function RegisterPage() {
  const router = useRouter();

  function handleRegister(data: {
    username: string;
    email: string;
    password: string;
  }) {
    register(data);
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

        <RegisterForm onRegister={handleRegister} />

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
