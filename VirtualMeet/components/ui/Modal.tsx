"use client";

import { ReactNode, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-2xl bg-gray-900 p-6 text-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between">
          {title && (
            <h2 className="text-xl font-bold">
              {title}
            </h2>
          )}

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg px-3 py-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
