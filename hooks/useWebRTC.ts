import { useCallback, useEffect, useRef, useState } from "react";

import {
  addIceCandidate,
  addStreamToPeer,
  closePeerConnection,
  createAnswer,
  createOffer,
  createPeerConnection,
  defaultPeerConfig,
  setRemoteDescription,
} from "../services/webrtc";
import { getSocket, RoomUser } from "../services/socket";

interface UseWebRTCOptions {
  localStream: MediaStream | null;
  selfSocketId?: string | null;
}

interface RemotePeer {
  user: RoomUser;
  stream: MediaStream | null;
}

/**
 * Manages one RTCPeerConnection per remote participant.
 *
 * Flow:
 * - When a new participant joins after us, WE create the offer (we're the
 *   "existing" peer from their perspective).
 * - When we join a room with existing participants, THEY create the offer
 *   to us (handled by "webrtc-offer" listener below), and we answer.
 * - ICE candidates are relayed through the socket as they're discovered.
 */
export function useWebRTC({ localStream, selfSocketId }: UseWebRTCOptions) {
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
    new Map()
  );

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  useEffect(() => {
    localStreamRef.current = localStream;

    // If tracks change (e.g. camera toggled after connections exist),
    // make sure already-open peer connections send the latest tracks.
    peersRef.current.forEach((peer) => {
      const senders = peer.getSenders();

      localStream?.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);

        if (sender) {
          sender.replaceTrack(track);
        } else {
          peer.addTrack(track, localStream);
        }
      });
    });
  }, [localStream]);

  const upsertRemotePeer = useCallback(
    (socketId: string, update: Partial<RemotePeer>) => {
      setRemotePeers((current) => {
        const next = new Map(current);
        const existing = next.get(socketId);

        if (!existing && !update.user) {
          return current;
        }

        next.set(socketId, {
          user: update.user ?? existing!.user,
          stream: update.stream !== undefined ? update.stream : existing?.stream ?? null,
        });

        return next;
      });
    },
    []
  );

  const removeRemotePeer = useCallback((socketId: string) => {
    setRemotePeers((current) => {
      if (!current.has(socketId)) return current;

      const next = new Map(current);
      next.delete(socketId);

      return next;
    });

    const peer = peersRef.current.get(socketId);

    if (peer) {
      closePeerConnection(peer);
      peersRef.current.delete(socketId);
    }
  }, []);

  const buildPeerConnection = useCallback(
    (remoteSocketId: string): RTCPeerConnection => {
      const socket = getSocket();
      const peer = createPeerConnection(defaultPeerConfig);

      if (localStreamRef.current) {
        addStreamToPeer(peer, localStreamRef.current);
      }

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc-ice-candidate", {
            to: remoteSocketId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      peer.ontrack = (event) => {
        const [stream] = event.streams;
        upsertRemotePeer(remoteSocketId, { stream: stream ?? null });
      };

      peer.onconnectionstatechange = () => {
        if (
          peer.connectionState === "failed" ||
          peer.connectionState === "closed"
        ) {
          removeRemotePeer(remoteSocketId);
        }
      };

      peersRef.current.set(remoteSocketId, peer);

      return peer;
    },
    [removeRemotePeer, upsertRemotePeer]
  );

  const callPeer = useCallback(
    async (remoteUser: RoomUser) => {
      if (selfSocketId && remoteUser.socketId === selfSocketId) return;

      const socket = getSocket();
      const peer = buildPeerConnection(remoteUser.socketId);

      upsertRemotePeer(remoteUser.socketId, { user: remoteUser });

      const offer = await createOffer(peer);

      socket.emit("webrtc-offer", {
        to: remoteUser.socketId,
        offer,
      });
    },
    [buildPeerConnection, upsertRemotePeer]
  );

  useEffect(() => {
    const socket = getSocket();

    async function handleOffer({
      from,
      offer,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
    }) {
      let peer = peersRef.current.get(from);

      if (!peer) {
        peer = buildPeerConnection(from);
      }

      await setRemoteDescription(peer, offer);
      const answer = await createAnswer(peer);

      socket.emit("webrtc-answer", { to: from, answer });
    }

    async function handleAnswer({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) {
      const peer = peersRef.current.get(from);

      if (peer) {
        await setRemoteDescription(peer, answer);
      }
    }

    async function handleIceCandidate({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) {
      const peer = peersRef.current.get(from);

      if (peer) {
        await addIceCandidate(peer, candidate);
      }
    }

    function handleParticipantUpdated(user: RoomUser) {
      // The server echoes update-status to everyone in the room, including
      // the sender. Without this guard we'd create a "remote peer" entry
      // for ourselves, which shows up as a phantom duplicate video tile.
      if (selfSocketId && user.socketId === selfSocketId) return;

      upsertRemotePeer(user.socketId, { user });
    }

    function handleParticipantLeft({ socketId }: { socketId: string }) {
      removeRemotePeer(socketId);
    }

    socket.on("webrtc-offer", handleOffer);
    socket.on("webrtc-answer", handleAnswer);
    socket.on("webrtc-ice-candidate", handleIceCandidate);
    socket.on("participant-updated", handleParticipantUpdated);
    socket.on("participant-left", handleParticipantLeft);

    return () => {
      socket.off("webrtc-offer", handleOffer);
      socket.off("webrtc-answer", handleAnswer);
      socket.off("webrtc-ice-candidate", handleIceCandidate);
      socket.off("participant-updated", handleParticipantUpdated);
      socket.off("participant-left", handleParticipantLeft);
    };
  }, [buildPeerConnection, removeRemotePeer, upsertRemotePeer, selfSocketId]);

  const closeAllPeers = useCallback(() => {
    peersRef.current.forEach((peer) => closePeerConnection(peer));
    peersRef.current.clear();
    setRemotePeers(new Map());
  }, []);

  return {
    remotePeers,
    callPeer,
    closeAllPeers,
  };
}
