"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../../services/auth";
import { createMeeting } from "../../database/meetings";
import { generateRoomId } from "../../lib/utils";
import { Meeting } from "../../types/meeting";

export default function CreatePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const user = getCurrentUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    const roomId = generateRoomId();

    const meeting: Meeting = {
      id: roomId,
      roomId,
      title: title.trim() || "Virtual Meeting",
      hostId: user.id,
      participants: [user.id],
      createdAt: new Date().toISOString(), // ✅ تبدیل Date به string
      isActive: true,
    };

    createMeeting(meeting);

    router.push(`/room/${roomId}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">🎥</div>

          <h1 className="text-3xl font-bold">ساخت جلسه جدید</h1>

          <p className="mt-2 text-sm text-gray-400">
            یک اتاق جدید برای جلسه‌ات بساز
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="meeting-title"
              className="mb-2 block text-sm text-gray-300"
            >
              عنوان جلسه
            </label>

            <input
              id="meeting-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="مثلاً جلسه تیم Virtual"
              className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "در حال ساخت..." : "ساخت جلسه"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-4 w-full rounded-xl bg-gray-800 px-4 py-3 text-gray-300 transition hover:bg-gray-700"
        >
          بازگشت به داشبورد
        </button>
      </div>
    </main>
  );
}
