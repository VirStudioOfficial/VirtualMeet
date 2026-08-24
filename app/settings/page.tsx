"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser, logout } from "../../services/auth";
import { User } from "../../types/user";

export default function SettingsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [cameraOff, setCameraOff] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);
    setCameraOff(Boolean(currentUser.isCameraOff));
    setMicMuted(Boolean(currentUser.isMuted));
  }, [router]);

  function handleSave() {
    if (!user) {
      return;
    }

    const updatedUser: User = {
      ...user,
      isCameraOff: cameraOff,
      isMuted: micMuted,
    };

    localStorage.setItem(
      "virtual-meet-user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
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
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">تنظیمات</h1>

          <p className="mt-1 text-gray-400">
            ترجیحات پیش‌فرض دوربین، میکروفون و حساب کاربری
          </p>
        </div>

        <section className="rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-5 text-lg font-semibold">
            تنظیمات پیش‌فرض جلسه
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-gray-800 px-4 py-3">
              <div>
                <p className="font-medium">دوربین</p>
                <p className="text-sm text-gray-400">
                  ورود به جلسه با دوربین خاموش
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCameraOff((prev) => !prev)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  cameraOff
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {cameraOff ? "خاموش" : "روشن"}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-gray-800 px-4 py-3">
              <div>
                <p className="font-medium">میکروفون</p>
                <p className="text-sm text-gray-400">
                  ورود به جلسه با میکروفون قطع
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMicMuted((prev) => !prev)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  micMuted
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {micMuted ? "قطع" : "فعال"}
              </button>
            </div>
          </div>

          {saved && (
            <div className="mt-5 rounded-xl bg-green-900/30 p-3 text-sm text-green-400">
              ✅ تنظیمات با موفقیت ذخیره شد.
            </div>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="mt-6 w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </section>

        <section className="mt-6 rounded-2xl bg-gray-900 p-6">
          <h2 className="mb-4 text-lg font-semibold">حساب کاربری</h2>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold hover:bg-red-700"
          >
            خروج از حساب
          </button>
        </section>

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
