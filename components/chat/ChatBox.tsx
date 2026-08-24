"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import MessageItem from "./MessageItem";

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface ChatBoxProps {
  messages?: ChatMessage[];
  currentUserId?: string;
  onSendMessage?: (message: string) => void;
}

export default function ChatBox({
  messages = [],
  currentUserId,
  onSendMessage,
}: ChatBoxProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    onSendMessage?.(trimmedMessage);
    setMessage("");
  }

  return (
    <div className="flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-lg font-bold">
          💬 Chat
        </h2>

        <p className="mt-1 text-xs text-gray-500">
          پیام‌های جلسه
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center">
            <div>
              <div className="mb-2 text-4xl">
                💬
              </div>

              <p className="text-sm text-gray-500">
                هنوز پیامی ارسال نشده است.
              </p>
            </div>
          </div>
        ) : (
          messages.map((item) => (
            <MessageItem
              key={item.id}
              username={item.username}
              message={item.message}
              timestamp={item.timestamp}
              isOwn={
                item.userId === currentUserId
              }
            />
          ))
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-gray-800 p-3"
      >
        <input
          type="text"
          value={message}
          onChange={(event) =>
            setMessage(event.target.value)
          }
          placeholder="پیامت رو بنویس..."
          maxLength={1000}
          className="min-w-0 flex-1 rounded-xl bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />

        <button
          type="submit"
          disabled={!message.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ارسال
        </button>
      </form>
    </div>
  );
}
