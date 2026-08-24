"use client";

import { useEffect, useCallback, useState } from "react";

import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";

// getSocket() returns a Socket typed with the app's specific
// ServerToClientEvents/ClientToServerEvents maps, which only allow emitting
// known event names with known payload shapes. This hook is a generic
// pass-through (any event name, any payload), so we intentionally widen to
// an untyped emitter/listener here rather than fighting the overloads
// (casting individual arguments to `never` breaks the overload resolution
// and produces a "[never] is not assignable to never" error).
type GenericSocket = {
  connected: boolean;
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (data: unknown) => void) => void;
  off: (event: string, callback: (data: unknown) => void) => void;
};

function asGenericSocket(socket: unknown): GenericSocket {
  return socket as GenericSocket;
}

export default function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = asGenericSocket(connectSocket());

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    setConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      disconnectSocket();
    };
  }, []);

  const emit = useCallback((event: string, data?: unknown) => {
    asGenericSocket(getSocket()).emit(event, data);
  }, []);

  const subscribe = useCallback(
    (event: string, callback: (data: unknown) => void) => {
      const socket = asGenericSocket(getSocket());

      socket.on(event, callback);

      return () => {
        socket.off(event, callback);
      };
    },
    []
  );

  return {
    connected,
    emit,
    subscribe,
  };
}
