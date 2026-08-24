"use client";

interface MeetingControlsProps {
  onLeave: () => void;
  onEndMeeting?: () => void;
  isHost?: boolean;
}

export default function MeetingControls({
  onLeave,
  onEndMeeting,
  isHost = false,
}: MeetingControlsProps) {

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-gray-900 p-4">

      <button
        onClick={onLeave}
        className="rounded-xl bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-700"
      >
        🚪 خروج از جلسه
      </button>


      {isHost && onEndMeeting && (
        <button
          onClick={onEndMeeting}
          className="rounded-xl bg-red-900 px-5 py-3 font-semibold transition hover:bg-red-800"
        >
          🛑 پایان جلسه برای همه
        </button>
      )}

    </div>
  );
}
