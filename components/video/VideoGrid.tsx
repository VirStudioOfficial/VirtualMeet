"use client";

import VideoPlayer from "./VideoPlayer";
import { User } from "../../types/user";

interface VideoParticipant {
  user: User;
  stream?: MediaStream | null;
}

interface VideoGridProps {
  participants: VideoParticipant[];
}

export default function VideoGrid({
  participants,
}: VideoGridProps) {
  if (participants.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center rounded-2xl bg-gray-900">
        <p className="text-gray-400">
          No participants
        </p>
      </div>
    );
  }

  const gridClass =
    participants.length === 1
      ? "grid-cols-1"
      : participants.length <= 4
        ? "grid-cols-2"
        : participants.length <= 9
          ? "grid-cols-3"
          : "grid-cols-4";

  return (
    <div
      className={`grid h-full min-h-[400px] w-full gap-3 ${gridClass}`}
    >
      {participants.map(({ user, stream }) => (
        <VideoPlayer
          key={user.id}
          stream={stream}
          username={user.username}
          muted={user.id === participants[0]?.user.id}
          isCameraOn={!user.isCameraOff}
          className="min-h-[220px]"
        />
      ))}
    </div>
  );
}
