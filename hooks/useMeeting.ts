import { useCallback, useEffect, useRef, useState } from "react";

import { User } from "../types/user";
import { Message } from "../types/message";
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  RoomUser,
  ChatMessagePayload,
} from "../services/socket";

interface UseMeetingOptions {
  roomId: string;
  currentUser: User;
}

function toUser(roomUser: RoomUser): User {
  return {
    id: roomUser.socketId,
    username: roomUser.username,
    isHost: roomUser.isHost,
    isMuted: roomUser.isMuted,
    isCameraOff: roomUser.isCameraOff,
  };
}

export function useMeeting({ roomId, currentUser }: UseMeetingOptions) {
  const [participants, setParticipants] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [selfSocketId, setSelfSocketId] = useState<string | null>(null);

  // Participants who joined the room before/after us, exposed so the
  // WebRTC layer knows who to call. Kept separate from `participants`
  // (which is UI-facing) to avoid coupling signaling to render state.
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);

  const joinedRef = useRef(false);

  const joinMeeting = useCallback(() => {
    if (joinedRef.current) return;

    const socket = connectSocket();
    joinedRef.current = true;

    socket.emit("join-room", {
      roomId,
      user: { id: currentUser.id, username: currentUser.username },
    });
  }, [roomId, currentUser.id, currentUser.username]);

  const leaveMeeting = useCallback(() => {
    const socket = getSocket();

    socket.emit("leave-room");
    disconnectSocket();

    joinedRef.current = false;
    setParticipants([]);
    setRoomUsers([]);
    setMessages([]);
    setIsConnected(false);
    setIsHost(false);
    setSelfSocketId(null);
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const socket = getSocket();

      const message: ChatMessagePayload = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        roomId,
        senderId: currentUser.id,
        senderName: currentUser.username,
        content,
        createdAt: new Date().toISOString(),
      };

      socket.emit("chat-message", message);
    },
    [roomId, currentUser.id, currentUser.username]
  );

  const updateStatus = useCallback(
    (updates: { isMuted?: boolean; isCameraOff?: boolean }) => {
      const socket = getSocket();
      socket.emit("update-status", updates);
    },
    []
  );

  useEffect(() => {
    const socket = getSocket();

    function handleRoomJoined(payload: {
      self: RoomUser;
      participants: RoomUser[];
    }) {
      setSelfSocketId(payload.self.socketId);
      setIsHost(payload.self.isHost);
      setIsConnected(true);

      const others = payload.participants;
      setRoomUsers(others);
      setParticipants([toUser(payload.self), ...others.map(toUser)]);
    }

    function handleParticipantJoined(user: RoomUser) {
      setRoomUsers((current) => [...current, user]);
      setParticipants((current) => [...current, toUser(user)]);
    }

    function handleParticipantLeft({ socketId }: { socketId: string }) {
      setRoomUsers((current) => current.filter((u) => u.socketId !== socketId));
      setParticipants((current) => current.filter((u) => u.id !== socketId));
    }

    function handleParticipantUpdated(user: RoomUser) {
      setRoomUsers((current) =>
        current.map((u) => (u.socketId === user.socketId ? user : u))
      );
      setParticipants((current) =>
        current.map((u) => (u.id === user.socketId ? toUser(user) : u))
      );
      setIsHost((current) =>
        user.socketId === selfSocketId ? user.isHost : current
      );
    }

    function handleChatMessage(payload: ChatMessagePayload) {
      setMessages((current) => [
        ...current,
        {
          id: payload.id,
          roomId: payload.roomId,
          senderId: payload.senderId,
          senderName: payload.senderName,
          content: payload.content,
          createdAt: new Date(payload.createdAt),
        },
      ]);
    }

    socket.on("room-joined", handleRoomJoined);
    socket.on("participant-joined", handleParticipantJoined);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("participant-updated", handleParticipantUpdated);
    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("participant-updated", handleParticipantUpdated);
      socket.off("chat-message", handleChatMessage);
    };
  }, [selfSocketId]);

  useEffect(() => {
    return () => {
      if (joinedRef.current) {
        leaveMeeting();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    participants,
    roomUsers,
    messages,
    isConnected,
    isHost,
    selfSocketId,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    updateStatus,
  };
}
