"use client";

import { useEffect, useCallback, useState } from "react";

import { connectSocket, disconnectSocket, getSocket } from "@/services/socket";

export default function useSocket() {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = connectSocket();

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
    getSocket().emit(event as never, data as never);
  }, []);

  const subscribe = useCallback(
    (event: string, callback: (data: unknown) => void) => {
      const socket = getSocket();

      socket.on(event as never, callback as never);

      return () => {
        socket.off(event as never, callback as never);
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
