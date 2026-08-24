"use client";

import { useEffect, useState } from "react";

interface CameraControlsProps {
  stream?: MediaStream | null;
  initialOff?: boolean;
  onCameraChange?: (off: boolean) => void;
}

export default function CameraControls({
  stream = null,
  initialOff = false,
  onCameraChange,
}: CameraControlsProps) {
  const [isCameraOff, setIsCameraOff] =
    useState(initialOff);

  useEffect(() => {
    setIsCameraOff(initialOff);
  }, [initialOff]);

  function toggleCamera() {
    const nextOff = !isCameraOff;

    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !nextOff;
      });
    }

    setIsCameraOff(nextOff);
    onCameraChange?.(nextOff);
  }

  return (
    <button
      type="button"
      onClick={toggleCamera}
      aria-label={
        isCameraOff
          ? "فعال کردن دوربین"
          : "خاموش کردن دوربین"
      }
      className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition ${
        isCameraOff
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      <span>{isCameraOff ? "📷" : "🎥"}</span>

      <span>
        {isCameraOff
          ? "فعال کردن Camera"
          : "خاموش کردن Camera"}
      </span>
    </button>
  );
}
