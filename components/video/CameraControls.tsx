"use client";

interface CameraControlsProps {
  isCameraOn: boolean;
  isMicrophoneOn: boolean;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onLeave: () => void;
}

export default function CameraControls({
  isCameraOn,
  isMicrophoneOn,
  onToggleCamera,
  onToggleMicrophone,
  onLeave,
}: CameraControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={onToggleMicrophone}
        type="button"
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isMicrophoneOn
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isMicrophoneOn ? "🎤 Mic On" : "🔇 Mic Off"}
      </button>

      <button
        onClick={onToggleCamera}
        type="button"
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isCameraOn
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isCameraOn ? "📷 Camera On" : "🚫 Camera Off"}
      </button>

      <button
        onClick={onLeave}
        type="button"
        className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
      >
        🚪 خروج
      </button>
    </div>
  );
}
