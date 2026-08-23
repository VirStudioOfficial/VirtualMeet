"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinPage() {
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  function joinRoom() {
    if (roomId.trim()) {
      router.push(`/room/${roomId}`);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">
        Join Virtual Meet
      </h1>

      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter Room ID"
        className="px-4 py-3 rounded-xl text-black w-80"
      />

      <button
        onClick={joinRoom}
        className="mt-4 bg-white text-black px-8 py-3 rounded-xl font-bold"
      >
        Join Meeting
      </button>
    </main>
  );
}
