"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const id = roomId.trim();

    if (!id) {
      return;
    }

    router.push(`/room/${encodeURIComponent(id)}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-6 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mb-3 text-5xl">🚪</div>

          <h1 className="text-3xl font-bold">
            پیوستن به جلسه
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            کد جلسه را وارد کن تا وارد اتاق شوی
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="room-id"
              className="mb-2 block text-sm text-gray-300"
            >
              کد جلسه
            </label>

            <input
              id="room-id"
              type="text"
              value={roomId}
              onChange={(event) => setRoomId(event.target.value)}
              placeholder="مثلاً A7K92XQ"
              required
              className="w-full rounded-xl bg-gray-800 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-700"
          >
            ورود به جلسه
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
