"use client";

import { useEffect, useRef } from "react";

export default function Room({
  params,
}: {
  params: { id: string };
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
    <main className="min-h-screen bg-black text-white p-6 flex flex-col">

      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">
          Virtual Meet
        </h1>

        <p className="text-gray-400">
          Room: {params.id}
        </p>
      </div>


      <div className="flex-1 bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
        />
      </div>


      <div className="flex justify-center gap-4 mt-6">

        <button className="bg-white text-black px-6 py-3 rounded-xl">
          🎤 Microphone
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
