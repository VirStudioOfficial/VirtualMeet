"use client";

interface Participant {
  id: string;
  username: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isHost?: boolean;
}

interface ParticipantsProps {
  participants: Participant[];
  currentUserId?: string;
}

export default function Participants({
  participants,
  currentUserId,
}: ParticipantsProps) {
  if (participants.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-900 p-5 text-center">
        <div className="mb-2 text-3xl">👥</div>

        <p className="text-gray-400">
          هنوز کسی در جلسه نیست.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-900 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          Participants
        </h2>

        <span className="rounded-lg bg-gray-800 px-2 py-1 text-xs text-gray-400">
          {participants.length}
        </span>
      </div>

      <div className="space-y-2">
        {participants.map((participant) => {
          const isCurrentUser =
            participant.id === currentUserId;

          return (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-xl bg-gray-800 p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold">
                  {participant.username
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">
                      {participant.username}
                    </p>

                    {isCurrentUser && (
                      <span className="text-xs text-blue-400">
                        شما
                      </span>
                    )}

                    {participant.isHost && (
                      <span className="text-xs text-yellow-400">
                        👑
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    {participant.isCameraOff
                      ? "📷 دوربین خاموش"
                      : "📷 دوربین روشن"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-lg">
                {participant.isMuted ? "🔇" : "🎤"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
