"use client";

import { useEffect, useRef, useState } from "react";

export default function Room({
  params,
}: {
  params: { id: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");

    if (name) {
      setUsername(name);
    }

    async function startCamera() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }

    startCamera();
  }, []);

  return (
    <main className="h-screen bg-black text-white p-6 flex flex-col">

      <div className="flex justify-between mb-4">
        <h1 className="text-3xl font-bold">
          Virtual Meet
        </h1>

        <div className="text-gray-400">
          <p>Room: {params.id}</p>
        </div>
      </div>


      <div className="flex flex-1 gap-4">

        <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            muted
            className="w-full h-full object-cover"
          />

          <p className="p-3">
            👤 {username}
          </p>
        </div>


        <div className="w-64 bg-gray-900 rounded-2xl p-4">
          <h2 className="text-xl font-bold mb-4">
            Participants
          </h2>

          <p>
            🟢 {username}
          </p>

          <p className="text-gray-400 mt-3">
            Waiting for others...
          </p>
        </div>

      </div>


      <div className="flex justify-center gap-4 mt-4">
        <button className="bg-white text-black px-6 py-3 rounded-xl">
          🎤 Mic
        </button>

        <button className="bg-white text-black px-6 py-3 rounded-xl">
          📷 Camera
        </button>

        <button className="bg-red-600 px-6 py-3 rounded-xl">
          خروج
        </button>
      </div>

    </main>
  );
}
