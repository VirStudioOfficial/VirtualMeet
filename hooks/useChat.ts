"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ChatMessage,
} from "@/components/chat/ChatBox";

import {
  socket,
  socketEvents,
} from "@/services/socket";

interface UseChatOptions {
  meetingId: string;
  userId: string;
  username: string;
}

export default function useChat({
  meetingId,
  userId,
  username,
}: UseChatOptions) {
  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  useEffect(() => {
    const unsubscribe = socket.on(
      socketEvents.MESSAGE_SENT,
      (data) => {
        const message =
          data as ChatMessage & {
            meetingId?: string;
          };

        if (
          message.meetingId &&
          message.meetingId !== meetingId
        ) {
          return;
        }

        setMessages((current) => {
          if (
            current.some(
              (item) =>
                item.id === message.id
            )
          ) {
            return current;
          }

          return [...current, message];
        });
      }
    );

    return unsubscribe;
  }, [meetingId]);

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      const message: ChatMessage & {
        meetingId: string;
      } = {
        id: crypto.randomUUID(),
        meetingId,
        userId,
        username,
        message: trimmed.slice(0, 1000),
        timestamp:
          new Date().toISOString(),
      };

      socket.emit(
        socketEvents.MESSAGE_SENT,
        message
      );
    },
    [
      meetingId,
      userId,
      username,
    ]
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
