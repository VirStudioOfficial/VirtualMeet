"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../services/auth";
import { generateRoomId } from "../../lib/utils";
import { User } from "../../types/user";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);
  }, [router]);

  function createMeeting() {
    const roomId = generateRoomId();
    router.push(`/room/${roomId}`);
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">در حال بارگذاری...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              Virtual Meet
            </h1>

            <p className="mt-1 text-gray-400">
              سلام {user.username} 👋
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium transition hover:bg-red-700"
          >
            خروج
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-3">
          <button
            type="button"
            onClick={createMeeting}
            className="rounded-2xl bg-blue-600 p-6 text-right transition hover:bg-blue-700"
          >
            <div className="mb-3 text-4xl">➕</div>

            <h2 className="text-xl font-bold">
              ساخت جلسه جدید
            </h2>

            <p className="mt-2 text-sm text-blue-100">
              یک اتاق جلسه جدید بساز
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/join")}
            className="rounded-2xl bg-gray-900 p-6 text-right transition hover:bg-gray-800"
          >
            <div className="mb-3 text-4xl">🚪</div>

            <h2 className="text-xl font-bold">
              پیوستن به جلسه
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              با کد جلسه وارد شو
            </p>
          </button>

          <button
            type="button"
            onClick={() => router.push("/meetings")}
            className="rounded-2xl bg-gray-900 p-6 text-right transition hover:bg-gray-800"
          >
            <div className="mb-3 text-4xl">📅</div>

            <h2 className="text-xl font-bold">
              جلسات من
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              تاریخچه جلسات خودت
            </p>
          </button>
        </section>

        <section className="mt-8 rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-5 text-xl font-bold">
            دسترسی سریع
          </h2>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="rounded-xl bg-gray-800 px-5 py-3 hover:bg-gray-700"
            >
              👤 پروفایل
            </button>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="rounded-xl bg-gray-800 px-5 py-3 hover:bg-gray-700"
            >
              ⚙️ تنظیمات
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
