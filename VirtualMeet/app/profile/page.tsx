"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../../services/auth";
import { updateUser } from "../../database/users";
import { User } from "../../types/user";

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      router.replace("/login");
      return;
    }

    setUser(currentUser);
    setUsername(currentUser.username);
  }, [router]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !username.trim()) {
      return;
    }

    const updatedUser = updateUser(user.id, {
      username: username.trim(),
    });

    if (!updatedUser) {
      return;
    }

    localStorage.setItem(
      "virtual-meet-user",
      JSON.stringify(updatedUser)
    );

    setUser(updatedUser);
    setUsername(updatedUser.username);
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
            پروفایل
          </h1>

          <p className="mt-1 text-gray-400">
            اطلاعات حساب کاربری خودت
          </p>
        </div>

        <section className="rounded-2xl bg-gray-900 p-6">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-xl font-bold">
                {user.username}
              </h2>

              <p className="text-sm text-gray-400">
                {user.email}
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm text-gray-300"
              >
                نام کاربری
              </label>

              <input
                id="username"
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-gray-300"
              >
                ایمیل
              </label>

              <input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl bg-gray-800/60 px-4 py-3 text-gray-500"
              />
            </div>

            {saved && (
              <div className="rounded-xl bg-green-900/30 p-3 text-sm text-green-400">
                ✅ پروفایل با موفقیت ذخیره شد.
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-700"
            >
              ذخیره تغییرات
            </button>
          </form>
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
