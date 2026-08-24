"use client";

import { useEffect, useRef, useState } from "react";

interface ScreenShareProps {
  onStreamChange?: (stream: MediaStream | null) => void;
}

export default function ScreenShare({
  onStreamChange,
}: ScreenShareProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState("");

  async function startSharing() {
    try {
      setError("");

      if (!navigator.mediaDevices?.getDisplayMedia) {
        setError(
          "اشتراک‌گذاری صفحه در این مرورگر پشتیبانی نمی‌شود."
        );
        return;
      }

      if (streamRef.current) {
        return;
      }

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      const videoTrack = stream.getVideoTracks()[0];

      videoTrack?.addEventListener(
        "ended",
        stopSharing
      );

      setIsSharing(true);
      onStreamChange?.(stream);
    } catch {
      setError("اشتراک‌گذاری صفحه لغو یا ناموفق شد.");
      setIsSharing(false);
    }
  }

  function stopSharing() {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
    onStreamChange?.(null);
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      {isSharing && (
        <div className="relative overflow-hidden rounded-2xl bg-gray-900">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="max-h-[500px] w-full object-contain"
          />

          <div className="absolute left-3 top-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm backdrop-blur-sm">
            🖥️ در حال اشتراک‌گذاری صفحه
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={
          isSharing ? stopSharing : startSharing
        }
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isSharing
            ? "bg-red-600 hover:bg-red-700"
            : "bg-gray-800 hover:bg-gray-700"
        }`}
      >
        {isSharing
          ? "🛑 توقف اشتراک صفحه"
          : "🖥️ اشتراک صفحه"}
      </button>

      {error && (
        <p className="rounded-xl bg-red-900/30 p-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
