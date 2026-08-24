"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "../../services/auth";
import {
  getAllMeetings,
  deleteMeeting,
} from "../../database/meetings";
import { Meeting } from "../../types/meeting";

export default function MeetingsPage() {
  const router = useRouter();

  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const user = getCurrentUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    const userMeetings = getAllMeetings().filter(
      (meeting) =>
        meeting.hostId === user.id ||
        meeting.participants.includes(user.id)
    );

    setMeetings(userMeetings);
  }, [router]);

  function handleDelete(id: string) {
    deleteMeeting(id);

    setMeetings((current) =>
      current.filter((meeting) => meeting.id !== id)
    );
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              جلسات من
            </h1>

            <p className="mt-1 text-gray-400">
              تاریخچه جلسات و اتاق‌های شما
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/create")}
            className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
          >
            ➕ جلسه جدید
          </button>
        </header>

        {meetings.length === 0 ? (
          <div className="rounded-2xl bg-gray-900 p-10 text-center">
            <div className="mb-4 text-5xl">📅</div>

            <h2 className="text-xl font-bold">
              هنوز جلسه‌ای نداری
            </h2>

            <p className="mt-2 text-gray-400">
              اولین جلسه خودت رو بساز!
            </p>

            <button
              type="button"
              onClick={() => router.push("/create")}
              className="mt-5 rounded-xl bg-blue-600 px-5 py-3 hover:bg-blue-700"
            >
              ساخت جلسه
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-900 p-5"
              >
                <div>
                  <h2 className="text-lg font-bold">
                    {meeting.title}
                  </h2>

                  <p className="mt-1 text-sm text-gray-400">
                    Room: {meeting.roomId}
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    {new Date(
                      meeting.createdAt
                    ).toLocaleString("fa-IR")}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/room/${meeting.roomId}`)
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm hover:bg-blue-700"
                  >
                    ورود
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(meeting.id)
                    }
                    className="rounded-xl bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="mt-6 rounded-xl bg-gray-800 px-5 py-3 text-gray-300 hover:bg-gray-700"
        >
          ← بازگشت به داشبورد
        </button>
      </div>
    </main>
  );
}
