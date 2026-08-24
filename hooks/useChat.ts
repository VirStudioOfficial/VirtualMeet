"use client";

import { useCallback, useEffect, useState } from "react";

import { ChatMessage } from "@/components/chat/ChatBox";
import { ChatMessagePayload, getSocket } from "@/services/socket";

interface UseChatOptions {
  meetingId: string;
  userId: string;
  username: string;
}

export default function useChat({ meetingId, userId, username }: UseChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const socket = getSocket();

    const handleChatMessage = (data: ChatMessagePayload) => {
      if (data.roomId && data.roomId !== meetingId) {
        return;
      }

      const message: ChatMessage = {
        id: data.id,
        userId: data.senderId,
        username: data.senderName,
        message: data.content,
        timestamp: data.createdAt,
      };

      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }

        return [...current, message];
      });
    };

    socket.on("chat-message", handleChatMessage);

    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [meetingId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      const message: ChatMessagePayload = {
        id: crypto.randomUUID(),
        roomId: meetingId,
        senderId: userId,
        senderName: username,
        content: trimmed.slice(0, 1000),
        createdAt: new Date().toISOString(),
      };

      getSocket().emit("chat-message", message);
    },
    [meetingId, userId, username]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearMessages,
  };
}
