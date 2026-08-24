"use client";

import { useState } from "react";

interface MeetingControlsProps {
  onLeave?: () => void;
  onEndMeeting?: () => void;
  isHost?: boolean;
  disabled?: boolean;
}

export default function MeetingControls({
  onLeave,
  onEndMeeting,
  isHost = false,
  disabled = false,
}: MeetingControlsProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  function handleLeave() {
    if (disabled) {
      return;
    }

    onLeave?.();
  }

  function handleEndMeeting() {
    if (disabled) {
      return;
    }

    if (!isHost) {
      return;
    }

    setShowConfirm(true);
  }

  function confirmEndMeeting() {
    setShowConfirm(false);
    onEndMeeting?.();
  }

  return (
    <>
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleLeave}
          disabled={disabled}
          className="rounded-xl bg-gray-800 px-5 py-3 font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          🚪 خروج
        </button>

        {isHost && (
          <button
            type="button"
            onClick={handleEndMeeting}
            disabled={disabled}
            className="rounded-xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🛑 پایان جلسه
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-gray-900 p-6 text-white shadow-2xl">
            <h2 className="text-xl font-bold">
              پایان جلسه؟
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              با پایان جلسه، جلسه برای همه شرکت‌کنندگان
              غیرفعال می‌شود.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl bg-gray-800 px-4 py-3 hover:bg-gray-700"
              >
                لغو
              </button>

              <button
                type="button"
                onClick={confirmEndMeeting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 hover:bg-red-700"
              >
                پایان جلسه
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
