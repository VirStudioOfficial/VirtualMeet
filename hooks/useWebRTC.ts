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

export function useWebRTC({ localStream, selfSocketId }: UseWebRTCOptions) {
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
    new Map()
  );

  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(localStream);

  const renegotiate = useCallback(
    async (remoteSocketId: string, peer: RTCPeerConnection) => {
      if (peer.signalingState !== "stable") return;

      try {
        const offer = await createOffer(peer);
        getSocket().emit("webrtc-offer", {
          to: remoteSocketId,
          offer,
        });
      } catch (err) {
        console.error("Renegotiation offer error:", err);
      }
    },
    []
  );

  useEffect(() => {
    localStreamRef.current = localStream;

    peersRef.current.forEach((peer, remoteSocketId) => {
      if (!peer.currentLocalDescription || peer.signalingState !== "stable") return;

      const senders = peer.getSenders();
      let addedNewTrack = false;

      localStream?.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);

        if (sender) {
          if (sender.track !== track) {
            sender.replaceTrack(track);
          }
        } else {
          peer.addTrack(track, localStream);
          addedNewTrack = true;
        }
      });

      if (addedNewTrack) {
        renegotiate(remoteSocketId, peer);
      }
    });
  }, [localStream, renegotiate]);

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
        const stream = event.streams[0] || new MediaStream([event.track]);
        upsertRemotePeer(remoteSocketId, { stream });
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

      let peer = peersRef.current.get(remoteUser.socketId);
      if (!peer) {
        peer = buildPeerConnection(remoteUser.socketId);
      }

      upsertRemotePeer(remoteUser.socketId, { user: remoteUser });

      try {
        const offer = await createOffer(peer);
        getSocket().emit("webrtc-offer", {
          to: remoteUser.socketId,
          offer,
        });
      } catch (err) {
        console.error("Error creating offer:", err);
      }
    },
    [buildPeerConnection, upsertRemotePeer, selfSocketId]
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

      try {
        await setRemoteDescription(peer, offer);
        const answer = await createAnswer(peer);
        socket.emit("webrtc-answer", { to: from, answer });
      } catch (e) {
        console.error("Failed to handle WebRTC offer:", e);
      }
    }

    async function handleAnswer({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) {
      const peer = peersRef.current.get(from);
      if (!peer) return;

      if (peer.signalingState !== "have-local-offer") return;

      try {
        await setRemoteDescription(peer, answer);
      } catch (e) {
        console.error("Failed to handle WebRTC answer:", e);
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
