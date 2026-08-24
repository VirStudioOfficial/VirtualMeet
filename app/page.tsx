"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../services/auth";
import { User } from "../types/user";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md text-center">
        <div className="mb-4 text-6xl">🎥</div>

        <h1 className="text-4xl font-bold">Virtual Meet</h1>

        <p className="mt-3 text-gray-400">
          جلسات ویدیویی ساده، سریع و بدون دردسر.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => router.push(user ? "/create" : "/login")}
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            شروع جلسه‌ی جدید
          </button>

          <button
            type="button"
            onClick={() => router.push("/join")}
            className="w-full rounded-xl bg-gray-800 px-5 py-3 font-semibold hover:bg-gray-700"
          >
            پیوستن با کد جلسه
          </button>

          {!user && (
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full rounded-xl px-5 py-3 text-sm text-gray-400 hover:text-white"
            >
              ورود به حساب کاربری
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
