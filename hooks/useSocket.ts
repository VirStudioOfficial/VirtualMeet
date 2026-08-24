"use client";

import {
  useEffect,
  useCallback,
  useState,
} from "react";

import {
  socket,
} from "@/services/socket";


export default function useSocket() {
  const [connected, setConnected] =
    useState(false);


  useEffect(() => {
    setConnected(true);


    return () => {
      setConnected(false);
    };
  }, []);



  const emit = useCallback(
    (
      event: string,
      data?: unknown
    ) => {
      socket.emit(
        event,
        data
      );
    },
    []
  );



  const subscribe = useCallback(
    (
      event: string,
      callback: (
        data: unknown
      ) => void
    ) => {
      return socket.on(
        event,
        callback
      );
    },
    []
  );



  return {
    connected,
    emit,
    subscribe,
  };
}
