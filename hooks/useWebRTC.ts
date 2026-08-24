"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  addStreamToPeer,
  closePeerConnection,
  createPeerConnection,
} from "@/services/webrtc";

interface UseWebRTCOptions {
  localStream: MediaStream | null;
}

interface RemoteStream {
  userId: string;
  stream: MediaStream;
}

export default function useWebRTC({
  localStream,
}: UseWebRTCOptions) {
  const peersRef =
    useRef<Map<string, RTCPeerConnection>>(
      new Map()
    );

  const [remoteStreams, setRemoteStreams] =
    useState<RemoteStream[]>([]);

  const createPeer = useCallback(
    (userId: string) => {
      const existing =
        peersRef.current.get(userId);

      if (existing) {
        return existing;
      }

      const peer =
        createPeerConnection();

      if (localStream) {
        addStreamToPeer(
          peer,
          localStream
        );
      }

      peer.ontrack = (event) => {
        const stream =
          event.streams[0];

        if (!stream) {
          return;
        }

        setRemoteStreams((current) => {
          const exists = current.some(
            (item) =>
              item.userId === userId
          );

          if (exists) {
            return current.map((item) =>
              item.userId === userId
                ? {
                    ...item,
                    stream,
                  }
                : item
            );
          }

          return [
            ...current,
            {
              userId,
              stream,
            },
          ];
        });
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState ===
            "failed" ||
          peer.connectionState ===
            "closed" ||
          peer.connectionState ===
            "disconnected"
        ) {
          removePeer(userId);
        }
      };

      peersRef.current.set(
        userId,
        peer
      );

      return peer;
    },
    [localStream]
  );

  const removePeer = useCallback(
    (userId: string) => {
      const peer =
        peersRef.current.get(userId);

      if (peer) {
        closePeerConnection(peer);
        peersRef.current.delete(userId);
      }

      setRemoteStreams((current) =>
        current.filter(
          (item) =>
            item.userId !== userId
        )
      );
    },
    []
  );

  const removeAllPeers =
    useCallback(() => {
      peersRef.current.forEach(
        (peer) => {
          closePeerConnection(peer);
        }
      );

      peersRef.current.clear();
      setRemoteStreams([]);
    }, []);

  useEffect(() => {
    return () => {
      peersRef.current.forEach(
        (peer) => {
          closePeerConnection(peer);
        }
      );

      peersRef.current.clear();
    };
  }, []);

  return {
    remoteStreams,
    createPeer,
    removePeer,
    removeAllPeers,
  };
}
