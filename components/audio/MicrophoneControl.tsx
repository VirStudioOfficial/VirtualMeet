"use client";

import { useEffect, useState } from "react";

interface MicrophoneControlProps {
  stream?: MediaStream | null;
  initialMuted?: boolean;
  onMuteChange?: (muted: boolean) => void;
}

export default function MicrophoneControl({
  stream = null,
  initialMuted = false,
  onMuteChange,
}: MicrophoneControlProps) {
  const [isMuted, setIsMuted] =
    useState(initialMuted);

  useEffect(() => {
    setIsMuted(initialMuted);
  }, [initialMuted]);

  function toggleMicrophone() {
    const nextMuted = !isMuted;

    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !nextMuted;
      });
    }

    setIsMuted(nextMuted);
    onMuteChange?.(nextMuted);
  }

  return (
    <button
      type="button"
      onClick={toggleMicrophone}
      aria-label={
        isMuted
          ? "فعال کردن میکروفون"
          : "خاموش کردن میکروفون"
      }
      className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition ${
        isMuted
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gray-800 hover:bg-gray-700"
      }`}
    >
      <span>{isMuted ? "🔇" : "🎤"}</span>

      <span>
        {isMuted ? "فعال کردن Mic" : "خاموش کردن Mic"}
      </span>
    </button>
  );
}
