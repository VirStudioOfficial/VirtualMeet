"use client";

import { FormEvent, useState } from "react";
import { Message } from "../../types/message";
import MessageItem from "./MessageItem";

interface ChatBoxProps {
  messages: Message[];
  currentUserId: string;
  onSendMessage: (content: string) => void;
}

export default function ChatBox({
  messages,
  currentUserId,
  onSendMessage,
}: ChatBoxProps) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const content = input.trim();

    if (!content) {
      return;
    }

    onSendMessage(content);
    setInput("");
  }

  return (
    <aside className="flex h-full min-h-[400px] w-80 flex-col rounded-2xl bg-gray-900 text-white">
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-xl font-bold">Chat</h2>
        <p className="mt-1 text-sm text-gray-500">
          Meeting messages
        </p>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-gray-500">
            هنوز پیامی ارسال نشده.
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isOwnMessage={message.senderId === currentUserId}
            />
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-2 border-t border-gray-800 p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="پیامت رو بنویس..."
          className="min-w-0 flex-1 rounded-xl bg-gray-800 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:ring-2 focus:ring-blue-600"
        />

        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700"
        >
          ارسال
        </button>
      </form>
    </aside>
  );
}
