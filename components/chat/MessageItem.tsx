"use client";

import { Message } from "../../types/message";

interface MessageItemProps {
  message: Message;
  isOwnMessage?: boolean;
}

export default function MessageItem({
  message,
  isOwnMessage = false,
}: MessageItemProps) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
          isOwnMessage
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-gray-800 text-white"
        }`}
      >
        {!isOwnMessage && (
          <p className="mb-1 text-xs font-semibold text-gray-400">
            {message.senderName}
          </p>
        )}

        <p className="break-words text-sm">
          {message.content}
        </p>

        <p
          className={`mt-1 text-right text-[10px] ${
            isOwnMessage
              ? "text-blue-200"
              : "text-gray-500"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
