"use client";

interface MessageItemProps {
  username: string;
  message: string;
  timestamp?: string | number | Date;
  isOwn?: boolean;
}

export default function MessageItem({
  username,
  message,
  timestamp,
  isOwn = false,
}: MessageItemProps) {
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString("fa-IR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <div
      className={`flex ${
        isOwn ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isOwn
            ? "rounded-br-md bg-blue-600"
            : "rounded-bl-md bg-gray-800"
        }`}
      >
        {!isOwn && (
          <p className="mb-1 text-xs font-semibold text-blue-400">
            {username}
          </p>
        )}

        <p className="break-words text-sm text-white">
          {message}
        </p>

        {formattedTime && (
          <p
            className={`mt-1 text-[10px] ${
              isOwn
                ? "text-blue-200"
                : "text-gray-500"
            }`}
          >
            {formattedTime}
          </p>
        )}
      </div>
    </div>
  );
}
