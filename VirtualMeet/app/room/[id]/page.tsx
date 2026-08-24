"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function Room({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [username, setUsername] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("username");

    if (name) {
      setUsername(name);
    }

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
        setError(
          "دسترسی به دوربین یا میکروفون امکان‌پذیر نیست."
        );
      }
    }

    startMedia();

    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  function toggleCamera() {
    const track = streamRef.current?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
  }

  function toggleMic() {
    const track = streamRef.current?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
  }

  function leaveRoom() {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    router.push("/");
  }

  return (
    <main className="h-screen bg-black text-white p-6 flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">

        <div>
          <h1 className="text-3xl font-bold">
            Virtual Meet
          </h1>

          <p className="text-gray-400">
            Room: {params.id}
          </p>
        </div>

        <div className="text-gray-300">
          👤 {username || "Guest"}
        </div>

      </div>


      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4 text-center">
          {error}
        </div>
      )}


      {/* Meeting Area */}
      <div className="flex flex-1 gap-4 min-h-0">

        {/* Video */}
        <div className="relative flex-1 bg-gray-900 rounded-2xl overflow-hidden">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {!cameraOn && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
              <div className="text-center">
                <div className="text-6xl mb-3">
                  👤
                </div>

                <p className="text-xl">
                  {username || "Guest"}
                </p>

                <p className="text-gray-400">
                  Camera is off
                </p>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 left-4 bg-black/60 px-4 py-2 rounded-xl">
            👤 {username || "Guest"}
          </div>

        </div>


        {/* Participants */}
        <aside className="w-64 bg-gray-900 rounded-2xl p-4">

          <h2 className="text-xl font-bold mb-5">
            Participants
          </h2>

          <div className="flex items-center gap-2">
            <span className="text-green-400">
              ●
            </span>

            <span>
              {username || "Guest"}
            </span>
          </div>

          <p className="text-gray-500 mt-4 text-sm">
            Waiting for others...
          </p>

        </aside>

      </div>


      {/* Controls */}
      <div className="flex justify-center items-center gap-3 mt-4">

        <button
          onClick={toggleMic}
          className={`px-6 py-3 rounded-xl font-medium ${
            micOn
              ? "bg-white text-black"
              : "bg-red-600 text-white"
          }`}
        >
          {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
        </button>


        <button
          onClick={toggleCamera}
          className={`px-6 py-3 rounded-xl font-medium ${
            cameraOn
              ? "bg-white text-black"
              : "bg-red-600 text-white"
          }`}
        >
          {cameraOn ? "📷 Camera On" : "🚫 Camera Off"}
        </button>


        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium"
        >
          خروج
        </button>

      </div>

    </main>
  );
}
