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
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-2xl bg-gray-900 text-gray-500">
        هنوز کسی وارد جلسه نشده است.
      </div>
    );
  }


  return (
    <div
      className={`
        grid gap-4
        ${
          participants.length === 1
            ? "grid-cols-1"
            : participants.length <= 4
            ? "grid-cols-2"
            : "grid-cols-3"
        }
      `}
    >

      {participants.map((participant) => (
        <VideoPlayer
          key={participant.id}
          stream={participant.stream}
          username={participant.username}
          muted={participant.muted}
          cameraOff={participant.cameraOff}
          isLocal={
            participant.id === localUserId
          }
        />
      ))}

    </div>
  );
}
