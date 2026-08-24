"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../services/auth";
import { getUserById, updateUser } from "../database/users";
import { User } from "../types/user";

const USER_KEY = "virtual-meet-user";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    const freshUser =
      getUserById(currentUser.id) ?? currentUser;

    setUser(freshUser);
    setIsMuted(freshUser.isMuted);
    setIsCameraOff(freshUser.isCameraOff);
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) {
      return;
    }

    const updatedUser = updateUser(user.id, {
      isMuted,
      isCameraOff,
    });

    if (!updatedUser) {
      return;
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
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

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            تنظیمات
          </h1>

          <p className="mt-1 text-gray-400">
            تنظیمات پیش‌فرض جلسه‌های Virtual Meet
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <section className="rounded-2xl bg-gray-900 p-6">
            <h2 className="mb-5 text-xl font-bold">
              🎥 تنظیمات جلسه
            </h2>

            <div className="space-y-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-800 p-4">
                <div>
                  <p className="font-semibold">
                    میکروفون خاموش باشد
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    هنگام ورود به جلسه میکروفون به‌صورت پیش‌فرض خاموش باشد.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isMuted}
                  onChange={(event) =>
                    setIsMuted(event.target.checked)
                  }
                  className="h-5 w-5"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl bg-gray-800 p-4">
                <div>
                  <p className="font-semibold">
                    دوربین خاموش باشد
                  </p>

                  <p className="mt-1 text-sm text-gray-400">
                    هنگام ورود به جلسه دوربین به‌صورت پیش‌فرض خاموش باشد.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={isCameraOff}
                  onChange={(event) =>
                    setIsCameraOff(event.target.checked)
                  }
                  className="h-5 w-5"
                />
              </label>
            </div>
          </section>

          {saved && (
            <div className="rounded-xl bg-green-900/30 p-3 text-sm text-green-400">
              ✅ تنظیمات با موفقیت ذخیره شد.
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            ذخیره تنظیمات
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-5 rounded-xl bg-gray-800 px-5 py-3 text-gray-300 hover:bg-gray-700"
        >
          ← بازگشت به داشبورد
        </button>
      </div>
    </main>
  );
}
