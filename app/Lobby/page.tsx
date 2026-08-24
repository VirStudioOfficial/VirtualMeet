"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LobbyContent() {
  const [name, setName] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const roomId = searchParams.get("room");

  function enterRoom() {
    if (name.trim() && roomId) {
      localStorage.setItem("username", name);
      router.push(`/room/${roomId}`);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-6">
        Welcome to Virtual Meet
      </h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        className="px-4 py-3 rounded-xl text-black w-80"
      />

      <button
        onClick={enterRoom}
        className="mt-4 bg-white text-black px-8 py-3 rounded-xl font-bold"
      >
        Join Room
      </button>
    </main>
  );
}

export default function Lobby() {
  return (
    <Suspense fallback={null}>
      <LobbyContent />
    </Suspense>
  );
}
