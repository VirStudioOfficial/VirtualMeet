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

  const renegotiate = useCallback(
    async (remoteSocketId: string, peer: RTCPeerConnection) => {
      // Never start a new offer while a negotiation is already in flight —
      // sending a second offer before the first offer/answer round trip
      // finishes causes the remote side to apply an answer to a
      // superseded offer ("wrong state: stable").
      if (peer.signalingState !== "stable") return;

      const offer = await createOffer(peer);

      getSocket().emit("webrtc-offer", {
        to: remoteSocketId,
        offer,
      });
    },
    []
  );

  useEffect(() => {
    localStreamRef.current = localStream;

    // If tracks change on an ALREADY-ESTABLISHED connection (e.g. camera
    // toggled, or a track added after the initial handshake completed),
    // make sure the peer connection sends the latest tracks.
    //
    // Important: this must NOT touch connections that are still doing
    // their initial offer/answer — buildPeerConnection() already adds
    // every current track before creating that first offer, so those
    // tracks are already included. Re-adding them here and firing a
    // second offer while the first handshake is still in flight is what
    // caused "Called in wrong state: stable" and meant media never
    // actually reached the remote side.
    peersRef.current.forEach((peer, remoteSocketId) => {
      // currentLocalDescription only exists once an offer/answer has
      // actually completed at least once — before that, this connection
      // is still doing its initial setup and already has our tracks.
      if (!peer.currentLocalDescription) return;

      const senders = peer.getSenders();
      let addedNewTrack = false;

      localStream?.getTracks().forEach((track) => {
        const sender = senders.find((s) => s.track?.kind === track.kind);

        if (sender) {
          if (sender.track !== track) {
            sender.replaceTrack(track);
          }
        } else {
          // A brand new transceiver. Unlike replaceTrack, this requires
          // renegotiation (a fresh offer/answer) before the remote side
          // actually receives anything on it.
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

      if (!peer) return;

      // Guard against any remaining race: an answer only makes sense
      // while we're waiting for one. A stray/late answer arriving after
      // the connection is already stable would otherwise throw
      // ("wrong state: stable") and abort the handler.
      if (peer.signalingState !== "have-local-offer") return;

      await setRemoteDescription(peer, answer);
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
