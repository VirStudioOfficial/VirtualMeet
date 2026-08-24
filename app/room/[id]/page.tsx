"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import useMeeting from "@/hooks/useMeeting";
import useCamera from "@/hooks/useCamera";

import VideoGrid, {
  VideoParticipant,
} from "@/components/video/VideoGrid";

import MeetingControls from "@/components/meeting/MeetingControls";
import Participants from "@/components/meeting/Participants";

import ChatBox, {
  ChatMessage,
} from "@/components/chat/ChatBox";

export default function RoomPage() {
  const params = useParams();

  const roomId = params.id as string;

  const {
    meeting,
    user,
    loading,
    joinMeeting,
    leaveMeeting,
  } = useMeeting(roomId);


  const {
    stream,
    cameraOff,
    muted,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMicrophone,
  } = useCamera();


  const [participants, setParticipants] =
    useState<VideoParticipant[]>([]);


  const [messages, setMessages] =
    useState<ChatMessage[]>([]);


  useEffect(() => {
    async function initializeRoom() {
      if (!loading && meeting && user) {
        joinMeeting();

        const cameraStream =
          await startCamera();


        setParticipants([
          {
            id: user.id,
            username: user.username,
            stream: cameraStream,
            muted,
            cameraOff,
          },
        ]);
      }
    }


    initializeRoom();

  }, [
    loading,
    meeting,
    user,
  ]);


  function handleLeave() {
    stopCamera();

    leaveMeeting();

    window.location.href = "/";
  }


  function handleEndMeeting() {
    stopCamera();

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


          <div className="flex justify-center gap-3">

            <button
              onClick={toggleMicrophone}
              className="rounded-xl bg-gray-800 px-5 py-3"
            >
              {muted
                ? "🎤 روشن کردن Mic"
                : "🔇 خاموش کردن Mic"}
            </button>


            <button
              onClick={toggleCamera}
              className="rounded-xl bg-gray-800 px-5 py-3"
            >
              {cameraOff
                ? "📷 روشن کردن Camera"
                : "🎥 خاموش کردن Camera"}
            </button>

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
