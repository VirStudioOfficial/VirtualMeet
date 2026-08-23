"use client";

import { useRouter } from "next/navigation";

export default function CreateMeeting() {
  const router = useRouter();

  function createRoom() {
    const id = Math.random().toString(36).substring(2, 8);
    router.push(`/room/${id}`);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">
      <button
        onClick={createRoom}
        className="bg-white text-black px-8 py-4 rounded-xl font-bold"
      >
        ساخت جلسه جدید
      </button>
    </main>
  );
}
