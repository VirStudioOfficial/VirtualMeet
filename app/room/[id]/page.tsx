"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import useMeeting from "@/hooks/useMeeting";

import VideoGrid, {
  VideoParticipant,
} from "@/components/video/VideoGrid";

import MeetingControls from "@/components/meeting/MeetingControls";
import Participants from "@/components/meeting/Participants";
import ChatBox, {
  ChatMessage,
} from "@/components/chat/ChatBox";

import {
  getCurrentUser,
} from "@/services/auth";

export default function RoomPage() {
  const params = useParams();

  const roomId =
    params.id as string;

  const {
    meeting,
    user,
    loading,
    joinMeeting,
    leaveMeeting,
  } = useMeeting(roomId);


  const [participants, setParticipants] =
    useState<VideoParticipant[]>([]);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);


  useEffect(() => {
    if (!loading && meeting && user) {
      joinMeeting();

      setParticipants([
        {
          id: user.id,
          username: user.username,
          stream: null,
          muted: user.isMuted,
          cameraOff: user.isCameraOff,
        },
      ]);
    }
  }, [
    loading,
    meeting,
    user,
    joinMeeting,
  ]);


  function handleLeave() {
    leaveMeeting();

    window.location.href = "/";
  }


  function handleEndMeeting() {
    window.location.href = "/";
  }


  function sendMessage(
    text: string
  ) {
    if (!user) {
      return;
    }

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      userId: user.id,
      username: user.username,
      message: text,
      timestamp:
        new Date().toISOString(),
    };

    setMessages((current) => [
      ...current,
      newMessage,
    ]);
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        در حال بارگذاری جلسه...
      </main>
    );
  }


  if (!meeting || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        جلسه پیدا نشد.
      </main>
    );
  }


  return (
    <main className="min-h-screen bg-black p-4 text-white">

      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {meeting.title}
        </h1>

        <p className="text-sm text-gray-500">
          Room ID: {meeting.roomId}
        </p>
      </div>


      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">

        <div className="space-y-4">

          <div className="min-h-[500px]">
            <VideoGrid
              participants={participants}
              localUserId={user.id}
            />
          </div>


          <MeetingControls
            onLeave={handleLeave}
            onEndMeeting={handleEndMeeting}
            isHost={
              meeting.hostId === user.id
            }
          />

        </div>


        <div className="space-y-4">

          <Participants
            participants={
              participants.map((item) => ({
                id: item.id,
                username: item.username,
                isMuted: item.muted,
                isCameraOff:
                  item.cameraOff,
                isHost:
                  item.id === meeting.hostId,
              }))
            }
            currentUserId={user.id}
          />


          <ChatBox
            messages={messages}
            currentUserId={user.id}
            onSendMessage={sendMessage}
          />

        </div>

      </div>

    </main>
  );
}
