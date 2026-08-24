"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import VideoGrid from "../../../components/video/VideoGrid";
import Participants from "../../../components/meeting/Participants";
import ChatBox from "../../../components/chat/ChatBox";
import ScreenShare from "../../../components/meeting/ScreenShare";
import { useMeeting } from "../../../hooks/useMeeting";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { getCurrentUser } from "../../../services/auth";
import { User } from "../../../types/user";

export default function Room({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: roomId } = use(params);
  const router = useRouter();

  const streamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [username, setUsername] = useState("");
  const [userId] = useState(
    () => `guest-${Math.random().toString(36).slice(2, 10)}`
  );
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [showScreenShare, setShowScreenShare] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);

  const currentUser: User = useMemo(
    () => ({ id: userId, username: username || "Guest" }),
    [userId, username]
  );

  const {
    participants,
    roomUsers,
    messages,
    isConnected,
    selfSocketId,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    updateStatus,
  } = useMeeting({ roomId, currentUser });

  const { remotePeers, callPeer, closeAllPeers } = useWebRTC({
    localStream,
    selfSocketId,
  });

  // 1. Grab local camera/mic on mount.
  useEffect(() => {
    const user = getCurrentUser();

    if (user?.username) {
      setUsername(user.username);
    } else {
      // No logged-in user found — fall back to a guest name so the
      // signaling connection still happens instead of hanging forever.
      setUsername(`Guest-${userId.slice(-4)}`);
    }

    // React Strict Mode (dev only) runs this effect, its cleanup, and
    // then this effect again on mount. getUserMedia is async, so without
    // this guard the FIRST call's promise can resolve AFTER the second
    // call has already started/finished, silently overwriting
    // streamRef.current with a stale stream object — meanwhile
    // toggleCamera/toggleMic keep reading whatever streamRef.current
    // happens to be, which no longer matches what's actually being
    // rendered or sent to peers. This made toggling look like it did
    // nothing, or turning the camera back on not work.
    let cancelled = false;

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (cancelled) {
          // This effect instance was already cleaned up before the
          // permission prompt resolved — don't adopt this stream, just
          // release it immediately so the camera light turns off.
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setLocalStream(stream);
      } catch {
        if (!cancelled) {
          setMediaError("دسترسی به دوربین یا میکروفون امکان‌پذیر نیست.");
        }
      }
    }

    startMedia();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  // 2. Once we have a username, join the signaling room. We wait for
  // localStream too so our first offer already carries our tracks.
  useEffect(() => {
    if (!username) return;

    joinMeeting();

    return () => {
      leaveMeeting();
      closeAllPeers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  // 3. Call every participant that was already in the room when we joined,
  // and any participant who joins after us. We only initiate the call from
  // our side to avoid both peers racing to send an offer.
  const calledRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    roomUsers.forEach((user) => {
      if (!calledRef.current.has(user.socketId)) {
        calledRef.current.add(user.socketId);
        callPeer(user);
      }
    });
  }, [roomUsers, callPeer]);

  function toggleCamera() {
    const track = localStream?.getVideoTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setCameraOn(track.enabled);
    updateStatus({ isCameraOff: !track.enabled });
  }

  function toggleMic() {
    const track = localStream?.getAudioTracks()[0];

    if (!track) return;

    track.enabled = !track.enabled;
    setMicOn(track.enabled);
    updateStatus({ isMuted: !track.enabled });
  }

  function leaveRoom() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    leaveMeeting();
    closeAllPeers();

    router.push("/");
  }

  // The original camera video track, kept aside so we can restore it
  // when screen-sharing stops. Screen-share is handled as a track swap
  // on the SAME localStream object (so every peer connection's existing
  // sender just gets a replaceTrack via the effect in useWebRTC) rather
  // than building a new MediaStream, which was losing the camera track
  // permanently once sharing ended.
  const cameraVideoTrackRef = useRef<MediaStreamTrack | null>(null);

  function handleScreenStreamChange(stream: MediaStream | null) {
    setScreenStream(stream);

    const currentStream = streamRef.current;

    if (!currentStream) return;

    if (stream) {
      const screenTrack = stream.getVideoTracks()[0];

      if (!screenTrack) return;

      const existingVideoTrack = currentStream.getVideoTracks()[0];

      if (existingVideoTrack) {
        cameraVideoTrackRef.current = existingVideoTrack;
        currentStream.removeTrack(existingVideoTrack);
        // Don't stop it — it's the camera track, we'll need it back.
      }

      currentStream.addTrack(screenTrack);
      setLocalStream(new MediaStream(currentStream.getTracks()));

      screenTrack.onended = () => {
        handleScreenStreamChange(null);
      };
    } else {
      currentStream.getVideoTracks().forEach((t) => {
        currentStream.removeTrack(t);
        t.stop();
      });

      const cameraTrack = cameraVideoTrackRef.current;

      if (cameraTrack && cameraTrack.readyState === "live") {
        currentStream.addTrack(cameraTrack);
      }

      cameraVideoTrackRef.current = null;

      setLocalStream(new MediaStream(currentStream.getTracks()));
    }
  }

  const videoParticipants = useMemo(() => {
    const self = {
      user: {
        id: selfSocketId ?? userId,
        username: username || "Guest",
        isCameraOff: !cameraOn,
        isMuted: !micOn,
      },
      stream: localStream,
    };

    const others = Array.from(remotePeers.values()).map((peer) => ({
      user: {
        id: peer.user.socketId,
        username: peer.user.username,
        isCameraOff: peer.user.isCameraOff,
        isMuted: peer.user.isMuted,
      },
      stream: peer.stream,
    }));

    return [self, ...others];
  }, [selfSocketId, userId, username, cameraOn, micOn, localStream, remotePeers]);

  return (
    <main className="h-screen bg-black text-white p-6 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-bold">Virtual Meet</h1>

          <p className="text-gray-400">
            Room: {roomId} {isConnected ? "🟢" : "🟡 در حال اتصال..."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowChat((v) => !v)}
            className="bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium"
          >
            💬 چت
          </button>

          <div className="text-gray-300">👤 {username || "Guest"}</div>
        </div>
      </div>

      {/* Error */}
      {mediaError && (
        <div className="bg-red-900/50 border border-red-500 rounded-xl p-3 mb-4 text-center">
          {mediaError}
        </div>
      )}

      {/* Meeting Area */}
      <div className="flex flex-1 gap-4 min-h-0">
        <div className="flex-1 min-h-0">
          <VideoGrid participants={videoParticipants} />
        </div>

        <Participants participants={participants} currentUserId={selfSocketId ?? undefined} />

        {showScreenShare && (
          <div className="w-80">
            <ScreenShare onStreamChange={handleScreenStreamChange} />
          </div>
        )}

        {showChat && (
          <ChatBox
            messages={messages}
            currentUserId={userId}
            onSendMessage={sendMessage}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          onClick={toggleMic}
          className={`px-6 py-3 rounded-xl font-medium ${
            micOn ? "bg-white text-black" : "bg-red-600 text-white"
          }`}
        >
          {micOn ? "🎤 Mic On" : "🔇 Mic Off"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-6 py-3 rounded-xl font-medium ${
            cameraOn ? "bg-white text-black" : "bg-red-600 text-white"
          }`}
        >
          {cameraOn ? "📷 Camera On" : "🚫 Camera Off"}
        </button>

        <button
          onClick={() => setShowScreenShare((v) => !v)}
          className={`px-6 py-3 rounded-xl font-medium ${
            screenStream ? "bg-blue-600 text-white" : "bg-white text-black"
          }`}
        >
          🖥️ Share Screen
        </button>

        <button
          onClick={leaveRoom}
          className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-medium"
        >
          خروج
        </button>
      </div>
    </main>
  );
}
