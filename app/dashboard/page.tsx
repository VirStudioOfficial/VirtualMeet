"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../services/auth";
import { getAllMeetings } from "../../database/meetings";
import { User } from "../../types/user";
import { Meeting } from "../../types/meeting";

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);

    const userMeetings = getAllMeetings().filter(
      (meeting) =>
        meeting.hostId === currentUser.id ||
        meeting.participants.includes(currentUser.id)
    );

    setMeetings(userMeetings);
  }, [router]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-gray-400">
          در حال بارگذاری...
        </p>
      </main>
    );
  }

  const activeMeetings = meetings.filter(
    (meeting) => meeting.isActive
  );

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-400">
              خوش اومدی 👋
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              {user.username}
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              {user.email}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
            >
              👤 پروفایل
            </button>

            <button
              type="button"
              onClick={() => router.push("/settings")}
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm hover:bg-gray-700"
            >
              ⚙️ تنظیمات
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
            >
              خروج
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-gray-900 p-5">
            <p className="text-sm text-gray-400">
              کل جلسات
            </p>

            <p className="mt-2 text-3xl font-bold">
              {meetings.length}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-900 p-5">
            <p className="text-sm text-gray-400">
              جلسات فعال
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeMeetings.length}
            </p>
          </div>

          <div className="rounded-2xl bg-gray-900 p-5">
            <p className="text-sm text-gray-400">
              وضعیت
            </p>

            <p className="mt-2 text-lg font-bold text-green-400">
              ● آنلاین
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-2xl bg-gray-900 p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">
                شروع جلسه
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                یک جلسه جدید بساز یا به یک اتاق وارد شو.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/create")}
              className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              ➕ ساخت جلسه
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/join")}
              className="rounded-xl bg-gray-800 p-4 text-right hover:bg-gray-700"
            >
              <span className="text-xl">🔗</span>

              <span className="mt-2 block font-semibold">
                ورود به جلسه
              </span>

              <span className="mt-1 block text-sm text-gray-400">
                با کد اتاق وارد جلسه شو
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/meetings")}
              className="rounded-xl bg-gray-800 p-4 text-right hover:bg-gray-700"
            >
              <span className="text-xl">📅</span>

              <span className="mt-2 block font-semibold">
                جلسات من
              </span>

              <span className="mt-1 block text-sm text-gray-400">
                مشاهده تاریخچه جلسات
              </span>
            </button>
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                آخرین جلسات
              </h2>

              <p className="mt-1 text-sm text-gray-400">
                جلساتی که اخیراً در آن‌ها بوده‌ای
              </p>
            </div>

            {meetings.length > 0 && (
              <button
                type="button"
                onClick={() => router.push("/meetings")}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                مشاهده همه
              </button>
            )}
          </div>

          {meetings.length === 0 ? (
            <div className="rounded-2xl bg-gray-900 p-8 text-center">
              <div className="mb-3 text-4xl">🎥</div>

              <h3 className="font-bold">
                هنوز جلسه‌ای نداری
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                اولین جلسه Virtual Meet خودت رو بساز.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meetings
                .slice()
                .reverse()
                .slice(0, 5)
                .map((meeting) => (
                  <div
                    key={meeting.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-900 p-5"
                  >
                    <div>
                      <h3 className="font-bold">
                        {meeting.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-400">
                        Room: {meeting.roomId}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {new Date(
                          meeting.createdAt
                        ).toLocaleString("fa-IR")}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/room/${meeting.roomId}`
                        )
                      }
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                    >
                      ورود به اتاق
                    </button>
                  </div>
                ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
