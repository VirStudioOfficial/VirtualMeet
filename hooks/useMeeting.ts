"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  connectSocket,
  disconnectSocket,
  getSocket,
  type ChatMessagePayload,
  type RoomUser,
} from "@/services/socket";

import { ChatMessage } from "@/components/chat/ChatBox";
import { User } from "@/types/user";

interface UseMeetingOptions {
  roomId: string;
  currentUser: Pick<User, "id" | "username">;
}

function toChatMessage(payload: ChatMessagePayload): ChatMessage {
  return {
    id: payload.id,
    userId: payload.senderId,
    username: payload.senderName,
    message: payload.content,
    timestamp: payload.createdAt,
  };
}

export function useMeeting({ roomId, currentUser }: UseMeetingOptions) {
  const [participants, setParticipants] = useState<RoomUser[]>([]);
  const [roomUsers, setRoomUsers] = useState<RoomUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selfSocketId, setSelfSocketId] = useState<string | null>(null);

  // Keep the latest currentUser/roomId in refs so joinMeeting/sendMessage
  // don't need to be recreated (and re-fired from the Room effect) every
  // time username changes mid-render.
  const currentUserRef = useRef(currentUser);
  currentUserRef.current = currentUser;

  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  useEffect(() => {
    const socket = getSocket();

    function handleRoomJoined(payload: { self: RoomUser; participants: RoomUser[] }) {
      setSelfSocketId(payload.self.socketId);
      setParticipants([payload.self, ...payload.participants]);
      setRoomUsers(payload.participants);
      setIsConnected(true);
    }

    function handleParticipantJoined(user: RoomUser) {
      setParticipants((current) => {
        if (current.some((p) => p.socketId === user.socketId)) {
          return current;
        }
        return [...current, user];
      });

      setRoomUsers((current) => {
        if (current.some((p) => p.socketId === user.socketId)) {
          return current;
        }
        return [...current, user];
      });
    }

    function handleParticipantLeft({ socketId }: { socketId: string }) {
      setParticipants((current) =>
        current.filter((p) => p.socketId !== socketId)
      );
      setRoomUsers((current) =>
        current.filter((p) => p.socketId !== socketId)
      );
    }

    function handleParticipantUpdated(user: RoomUser) {
      setParticipants((current) =>
        current.map((p) => (p.socketId === user.socketId ? user : p))
      );
      setRoomUsers((current) =>
        current.map((p) => (p.socketId === user.socketId ? user : p))
      );
    }

    function handleChatMessage(payload: ChatMessagePayload) {
      const message = toChatMessage(payload);

      setMessages((current) => {
        if (current.some((m) => m.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    }

    function handleDisconnect() {
      setIsConnected(false);
    }

    socket.on("room-joined", handleRoomJoined);
    socket.on("participant-joined", handleParticipantJoined);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("participant-updated", handleParticipantUpdated);
    socket.on("chat-message", handleChatMessage);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("participant-joined", handleParticipantJoined);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("participant-updated", handleParticipantUpdated);
      socket.off("chat-message", handleChatMessage);
      socket.off("disconnect", handleDisconnect);
    };
  }, []);

  const joinMeeting = useCallback(() => {
    const socket = connectSocket();

    const emitJoin = () => {
      socket.emit("join-room", {
        roomId: roomIdRef.current,
        user: {
          id: currentUserRef.current.id,
          username: currentUserRef.current.username,
        },
      });
    };

    if (socket.connected) {
      emitJoin();
    } else {
      socket.once("connect", emitJoin);
    }
  }, []);

  const leaveMeeting = useCallback(() => {
    const socket = getSocket();

    socket.emit("leave-room");
    disconnectSocket();

    setIsConnected(false);
    setSelfSocketId(null);
    setParticipants([]);
    setRoomUsers([]);
  }, []);

  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();

    if (!trimmed) return;

    const socket = getSocket();

    const payload: ChatMessagePayload = {
      id: crypto.randomUUID(),
      roomId: roomIdRef.current,
      senderId: currentUserRef.current.id,
      senderName: currentUserRef.current.username,
      content: trimmed.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    socket.emit("chat-message", payload);

    // Optimistically add our own message locally in case the server
    // doesn't echo it back to the sender (it currently does, via
    // io.to(roomId), but this keeps the UI snappy either way).
    setMessages((current) => {
      if (current.some((m) => m.id === payload.id)) {
        return current;
      }
      return [...current, toChatMessage(payload)];
    });
  }, []);

  const updateStatus = useCallback(
    (status: { isMuted?: boolean; isCameraOff?: boolean }) => {
      const socket = getSocket();
      socket.emit("update-status", status);
    },
    []
  );

  return {
    participants,
    roomUsers,
    messages,
    isConnected,
    selfSocketId,
    joinMeeting,
    leaveMeeting,
    sendMessage,
    updateStatus,
  };
}

export default useMeeting;
