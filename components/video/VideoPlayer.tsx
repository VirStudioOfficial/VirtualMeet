"use client";

import { useEffect, useRef } from "react";

interface VideoPlayerProps {
  stream?: MediaStream | null;
  username?: string;
  muted?: boolean;
  isCameraOn?: boolean;
  className?: string;
}

export default function VideoPlayer({
  stream,
  username = "Guest",
  muted = false,
  isCameraOn = true,
  className = "",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    videoRef.current.srcObject = stream ?? null;
  }, [stream]);

  // Bug fix: the <video> element used to be conditionally rendered based on
  // `isCameraOn` (unmounted whenever the camera was off). That destroyed the
  // DOM node and its ref, so when the camera came back on a brand-new
  // <video> element was mounted. Since the `stream` object reference itself
  // hadn't changed (only the underlying track's `enabled` flag toggles),
  // the effect above never re-ran and the new element's srcObject was never
  // set — leaving a permanently black tile until a full page refresh.
  //
  // Fix: always render the <video> element (so it, and its ref, persist
  // across camera toggles) and just visually hide/show it with the
  // "camera off" placeholder overlaid on top instead of replacing it.
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gray-900 ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`h-full w-full object-cover ${
          stream && isCameraOn ? "" : "hidden"
        }`}
      />

      {!(stream && isCameraOn) && (
        <div className="flex h-full min-h-[240px] w-full items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="mb-3 text-6xl">👤</div>

            <p className="text-lg font-semibold text-white">
              {username}
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Camera is off
            </p>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm text-white">
        {username}
      </div>
    </div>
  );
}
