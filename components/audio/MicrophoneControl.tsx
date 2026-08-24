"use client";

interface MicrophoneControlProps {
  isMicrophoneOn: boolean;
  onToggle: () => void;
}

export default function MicrophoneControl({
  isMicrophoneOn,
  onToggle,
}: MicrophoneControlProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={
        isMicrophoneOn
          ? "Turn microphone off"
          : "Turn microphone on"
      }
      className={`rounded-xl px-5 py-3 font-medium transition ${
        isMicrophoneOn
          ? "bg-white text-black hover:bg-gray-200"
          : "bg-red-600 text-white hover:bg-red-700"
      }`}
    >
      {isMicrophoneOn ? "🎤 Mic On" : "🔇 Mic Off"}
    </button>
  );
}
