"use client";

import { useCallback, useRef, useState } from "react";

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

  const startSharing = useCallback(async () => {
    try {
      setError("");

      const stream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsSharing(true);
      onStreamChange?.(stream);

      const videoTrack = stream.getVideoTracks()[0];

      if (videoTrack) {
        videoTrack.onended = () => {
          stream.getTracks().forEach((track) => track.stop());

          streamRef.current = null;

          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }

          setIsSharing(false);
          onStreamChange?.(null);
        };
      }
    } catch {
      setError("اشتراک‌گذاری صفحه شروع نشد.");
      setIsSharing(false);
    }
  }, [onStreamChange]);

  const stopSharing = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsSharing(false);
    onStreamChange?.(null);
  }, [onStreamChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative min-h-[240px] overflow-hidden rounded-2xl bg-gray-900">
        {isSharing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full min-h-[240px] w-full object-contain"
          />
        ) : (
          <div className="flex min-h-[240px] items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="mb-3 text-5xl">🖥️</div>
              <p>Screen sharing is off</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg bg-red-900/40 p-2 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={isSharing ? stopSharing : startSharing}
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isSharing
            ? "bg-red-600 text-white hover:bg-red-700"
            : "bg-white text-black hover:bg-gray-200"
        }`}
      >
        {isSharing
          ? "🛑 Stop Sharing"
          : "🖥️ Share Screen"}
      </button>
    </div>
  );
}
