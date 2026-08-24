"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  addStreamToPeer,
  closePeerConnection,
  createPeerConnection,
} from "@/services/webrtc";

import { getSocket, type RoomUser } from "@/services/socket";

interface UseWebRTCOptions {
  localStream: MediaStream | null;
  selfSocketId: string | null;
}

export interface RemotePeer {
  user: RoomUser;
  stream: MediaStream | null;
}

interface PeerEntry {
  connection: RTCPeerConnection;
  user: RoomUser;
}

export function useWebRTC({
  localStream,
  selfSocketId,
}: UseWebRTCOptions) {
  const peersRef = useRef<Map<string, PeerEntry>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
    new Map()
  );

  useEffect(() => {
    localStreamRef.current = localStream;

    // Whenever the local stream changes (camera/mic toggled, screen share
    // swapped in/out), push the current tracks to every existing peer
    // connection instead of waiting for a brand new connection to be made.
    peersRef.current.forEach(({ connection }) => {
      if (!localStream) return;

      localStream.getTracks().forEach((track) => {
        const sender = connection
          .getSenders()
          .find((s) => s.track?.kind === track.kind);

        if (sender) {
          if (sender.track?.id !== track.id) {
            sender.replaceTrack(track);
          }
        } else {
          connection.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  const updateRemotePeer = useCallback(
    (socketId: string, updates: Partial<RemotePeer>) => {
      setRemotePeers((current) => {
        const next = new Map(current);
        const existing = next.get(socketId);

        if (!existing) return current;

        next.set(socketId, { ...existing, ...updates });
        return next;
      });
    },
    []
  );

  const getOrCreatePeer = useCallback(
    (user: RoomUser): RTCPeerConnection => {
      const existing = peersRef.current.get(user.socketId);

      if (existing) {
        existing.user = user;
        return existing.connection;
      }

      const connection = createPeerConnection();

      if (localStreamRef.current) {
        addStreamToPeer(connection, localStreamRef.current);
      }

      connection.onicecandidate = (event) => {
        if (!event.candidate) return;

        getSocket().emit("webrtc-ice-candidate", {
          to: user.socketId,
          candidate: event.candidate.toJSON(),
        });
      };

      connection.ontrack = (event) => {
        const stream = event.streams[0] ?? null;
        updateRemotePeer(user.socketId, { stream });
      };

      connection.onconnectionstatechange = () => {
        if (
          connection.connectionState === "failed" ||
          connection.connectionState === "closed" ||
          connection.connectionState === "disconnected"
        ) {
          removePeer(user.socketId);
        }
      };

      peersRef.current.set(user.socketId, { connection, user });

      setRemotePeers((current) => {
        const next = new Map(current);
        next.set(user.socketId, { user, stream: null });
        return next;
      });

      return connection;
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [updateRemotePeer]
  );

  const removePeer = useCallback((socketId: string) => {
    const entry = peersRef.current.get(socketId);

    if (entry) {
      closePeerConnection(entry.connection);
      peersRef.current.delete(socketId);
    }

    setRemotePeers((current) => {
      if (!current.has(socketId)) return current;

      const next = new Map(current);
      next.delete(socketId);
      return next;
    });
  }, []);

  const closeAllPeers = useCallback(() => {
    peersRef.current.forEach(({ connection }) => {
      closePeerConnection(connection);
    });

    peersRef.current.clear();
    setRemotePeers(new Map());
  }, []);

  // We initiate the offer to a given peer (called by Room when a user is
  // already in the room, or joins after us).
  const callPeer = useCallback(
    async (user: RoomUser) => {
      const connection = getOrCreatePeer(user);

      try {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        getSocket().emit("webrtc-offer", {
          to: user.socketId,
          offer,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to create/send WebRTC offer:", error);
      }
    },
    [getOrCreatePeer]
  );

  // Handle incoming signaling events from peers who are calling us.
  //
  // Re-subscribes whenever selfSocketId changes: useMeeting's
  // leaveMeeting() calls disconnectSocket(), which tears down and nulls
  // the module-level socket instance, and the next joinMeeting() creates
  // a brand new one via getSocket(). selfSocketId only gets set (to a
  // fresh value) once a "room-joined" reply comes back on that new
  // instance, so keying off it here guarantees we're always attached to
  // the socket that's actually alive — never a torn-down one.
  useEffect(() => {
    const socket = getSocket();

    async function handleOffer({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) {
      // We don't have full RoomUser info for an inbound caller until
      // participant-joined/room-joined populates it via Room's roomUsers,
      // but we can still answer with a placeholder that gets reconciled
      // (getOrCreatePeer keeps `user` in sync on subsequent calls).
      const existing = peersRef.current.get(from);
      const user: RoomUser = existing?.user ?? {
        socketId: from,
        id: from,
        username: "Guest",
        isHost: false,
        isMuted: false,
        isCameraOff: false,
      };

      const connection = getOrCreatePeer(user);

      try {
        await connection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);

        socket.emit("webrtc-answer", { to: from, answer });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to handle WebRTC offer:", error);
      }
    }

    async function handleAnswer({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) {
      const entry = peersRef.current.get(from);

      if (!entry) return;

      try {
        await entry.connection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to handle WebRTC answer:", error);
      }
    }

    async function handleIceCandidate({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) {
      const entry = peersRef.current.get(from);

      if (!entry) return;

      try {
        await entry.connection.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to add ICE candidate:", error);
      }
    }

    function handleParticipantLeft({ socketId }: { socketId: string }) {
      removePeer(socketId);
    }

    function handleParticipantUpdated(user: RoomUser) {
      const entry = peersRef.current.get(user.socketId);

      if (entry) {
        entry.user = user;
      }

      updateRemotePeer(user.socketId, { user });
    }

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("participant-left", handleParticipantLeft);
    socket.on("participant-updated", handleParticipantUpdated);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("participant-left", handleParticipantLeft);
      socket.off("participant-updated", handleParticipantUpdated);
    };
  }, [getOrCreatePeer, removePeer, updateRemotePeer, selfSocketId]);

  useEffect(() => {
    return () => {
      peersRef.current.forEach(({ connection }) => {
        closePeerConnection(connection);
      });
      peersRef.current.clear();
    };
  }, []);

  return {
    remotePeers,
    callPeer,
    closeAllPeers,
  };
}

export default useWebRTC;
