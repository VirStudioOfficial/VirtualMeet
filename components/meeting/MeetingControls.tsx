"use client";

interface MeetingControlsProps {
  isMicrophoneOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  onToggleMicrophone: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onLeave: () => void;
}

export default function MeetingControls({
  isMicrophoneOn,
  isCameraOn,
  isScreenSharing,
  onToggleMicrophone,
  onToggleCamera,
  onToggleScreenShare,
  onLeave,
}: MeetingControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={onToggleMicrophone}
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isMicrophoneOn
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isMicrophoneOn ? "🎤 Mic On" : "🔇 Mic Off"}
      </button>

      <button
        type="button"
        onClick={onToggleCamera}
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isCameraOn
            ? "bg-white text-black hover:bg-gray-200"
            : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {isCameraOn ? "📷 Camera On" : "🚫 Camera Off"}
      </button>

      <button
        type="button"
        onClick={onToggleScreenShare}
        className={`rounded-xl px-5 py-3 font-medium transition ${
          isScreenSharing
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-gray-800 text-white hover:bg-gray-700"
        }`}
      >
        {isScreenSharing ? "🛑 Stop Sharing" : "🖥️ Share Screen"}
      </button>

      <button
        type="button"
        onClick={onLeave}
        className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700"
      >
        🚪 خروج
      </button>
    </div>
  );
}
