"use client";

import {
  useEffect,
  useRef,
} from "react";

interface VideoPlayerProps {
  stream?: MediaStream | null;
  username?: string;
  muted?: boolean;
  cameraOff?: boolean;
  isLocal?: boolean;
}

export default function VideoPlayer({
  stream = null,
  username = "User",
  muted = false,
  cameraOff = false,
  isLocal = false,
}: VideoPlayerProps) {

  const videoRef =
    useRef<HTMLVideoElement>(null);


  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return;
    }


    if (stream) {
      video.srcObject = stream;

      video.play()
        .catch(() => {});
    } else {
      video.srcObject = null;
    }


    return () => {
      video.srcObject = null;
    };

  }, [stream]);


  return (
    <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-2xl bg-gray-900">

      {!cameraOff && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal || muted}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-400">

          <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-3xl font-bold">
            {username
              .charAt(0)
              .toUpperCase()}
          </div>

          <p>
            دوربین خاموش است
          </p>

        </div>
      )}


      <div className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-3 py-1.5 text-sm backdrop-blur">
        {username}
      </div>


      <div className="absolute right-3 top-3 flex gap-2">

        {muted && (
          <span className="rounded-lg bg-black/60 px-2 py-1 text-sm">
            🔇
          </span>
        )}


        {cameraOff && (
          <span className="rounded-lg bg-black/60 px-2 py-1 text-sm">
            📷
          </span>
        )}

      </div>

    </div>
  );
}
