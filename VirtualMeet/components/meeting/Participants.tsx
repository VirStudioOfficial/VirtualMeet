"use client";

import { User } from "../../types/user";

interface ParticipantsProps {
  participants: User[];
  currentUserId?: string;
}

export default function Participants({
  participants,
  currentUserId,
}: ParticipantsProps) {
  return (
    <aside className="w-64 rounded-2xl bg-gray-900 p-4 text-white">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-bold">Participants</h2>

        <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-300">
          {participants.length}
        </span>
      </div>

      <div className="space-y-3">
        {participants.length === 0 ? (
          <p className="text-sm text-gray-500">
            No participants
          </p>
        ) : (
          participants.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-xl bg-gray-800 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-700">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-9 w-9 rounded-full object-cover"
                    />
                  ) : (
                    "👤"
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {user.username}
                    {user.id === currentUserId && " (You)"}
                  </p>

                  {user.isHost && (
                    <p className="text-xs text-yellow-400">
                      Host
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 text-sm">
                {user.isMuted ? "🔇" : "🎤"}
                {user.isCameraOff ? "🚫" : "📷"}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
