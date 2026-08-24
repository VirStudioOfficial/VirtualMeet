"use client";

import VideoPlayer from "./VideoPlayer";

export interface VideoParticipant {
  id: string;
  username: string;
  stream?: MediaStream | null;
  muted?: boolean;
  cameraOff?: boolean;
}

interface VideoGridProps {
  participants: VideoParticipant[];
  localUserId?: string;
}

export default function VideoGrid({
  participants,
  localUserId,
}: VideoGridProps) {
  if (participants.length === 0) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center rounded-2xl bg-gray-900">
        <div className="text-center text-gray-500">
          <div className="mb-3 text-5xl">👥</div>
          <p>هنوز کسی وارد جلسه نشده است.</p>
        </div>
      </div>
    );
  }

  const count = participants.length;

  const gridClass =
    count === 1
      ? "grid-cols-1"
      : count === 2
        ? "grid-cols-1 md:grid-cols-2"
        : count <= 4
          ? "grid-cols-1 sm:grid-cols-2"
          : count <= 9
            ? "grid-cols-2 md:grid-cols-3"
            : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4";

  return (
    <div
      className={`grid h-full min-h-[300px] gap-3 ${gridClass}`}
    >
      {participants.map((participant) => {
        const isLocal =
          participant.id === localUserId;

        return (
          <div
            key={participant.id}
            className="relative min-h-[200px] overflow-hidden rounded-2xl"
          >
            <VideoPlayer
              stream={participant.stream}
              muted={isLocal || participant.muted}
              username={participant.username}
              isCameraOff={participant.cameraOff}
            />

            {isLocal && (
              <div className="absolute right-3 top-3 rounded-lg bg-blue-600/80 px-2 py-1 text-xs font-medium backdrop-blur-sm">
                شما
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
