"use client";

import { useState } from "react";

export default function Room({
  params,
}: {
  params: { id: string };
}) {
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);

  return (
    <main className="min-h-screen bg-black text-white p-6 flex flex-col">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          Virtual Meet
        </h1>

        <p className="text-gray-400">
          Room: {params.id}
        </p>
      </div>


      <div className="flex-1 bg-gray-900 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500 text-xl">
          Camera Preview
        </p>
      </div>


      <div className="flex justify-center gap-4 mt-6">

        <button
          onClick={() => setMic(!mic)}
          className="bg-white text-black px-5 py-3 rounded-xl"
        >
          {mic ? "🎤 Mic On" : "🔇 Mic Off"}
        </button>


        <button
          onClick={() => setCamera(!camera)}
          className="bg-white text-black px-5 py-3 rounded-xl"
        >
          {camera ? "📷 Camera On" : "🚫 Camera Off"}
        </button>


        <button
          className="bg-red-600 px-5 py-3 rounded-xl"
        >
          خروج
        </button>

      </div>

    </main>
  );
}
