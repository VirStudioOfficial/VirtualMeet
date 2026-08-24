"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream?: MediaStream | null;
  muted?: boolean;
  username?: string;
  isCameraOff?: boolean;
  className?: string;
}

export default function VideoPlayer({
  stream = null,
  muted = false,
  username = "Guest",
  isCameraOff = false,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    video.srcObject = stream;

    if (stream) {
      video.play().catch(() => {});
    }

    return () => {
      if (video.srcObject === stream) {
        video.srcObject = null;
      }
    };
  }, [stream]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl bg-gray-900 ${className}`}
    >
      {stream && !isCameraOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gray-700 text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>

            <p className="text-gray-300">
              {username}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              دوربین خاموش است
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
        {username}
      </div>
    </div>
  );
}
