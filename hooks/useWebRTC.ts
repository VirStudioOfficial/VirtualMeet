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

  // ICE candidates from a peer can arrive before we've created our
  // RTCPeerConnection for them (e.g. their candidates race ahead of our
  // own offer/answer handling). Previously any candidate that arrived
  // before the connection existed was silently dropped (`if (!entry)
  // return`), which meant ICE negotiation could get stuck missing
  // candidates and never actually connect media — even though signaling
  // (chat) worked fine since that doesn't depend on ICE at all. We now
  // buffer those early candidates per socketId and flush them into the
  // connection as soon as it's created.
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(
    new Map()
  );

  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(
    new Map()
  );

  // Re-runs offer/answer negotiation on an existing connection after new
  // tracks were added post-hoc (see fix below). Without this, adding a
  // track after the initial connection never reaches the remote peer.
  //
  // Bug fix: guard against calling this while a negotiation is already
  // in flight. RTCPeerConnection.signalingState moves to
  // "have-local-offer" as soon as we call setLocalDescription(offer), and
  // only returns to "stable" once an answer has actually been applied. If
  // renegotiate() (or callPeer) fires again before that answer arrives —
  // e.g. this effect re-running because localStream's object reference
  // changed more than once in quick succession — we'd send a second
  // offer on a connection that's still waiting on the first one's
  // answer. The remote side then sends back two answers, and applying
  // the second one throws "Called in wrong state: stable" because the
  // connection was already back to stable by the time it arrived. Only
  // negotiate when the connection is actually idle.
  const renegotiate = useCallback(
    async (connection: RTCPeerConnection, user: RoomUser) => {
      if (connection.signalingState !== "stable") return;

      try {
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        getSocket().emit("webrtc-offer", {
          to: user.socketId,
          offer,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Failed to renegotiate WebRTC connection:", error);
      }
    },
    []
  );

  useEffect(() => {
    localStreamRef.current = localStream;

    // Whenever the local stream changes (camera/mic toggled, screen share
    // swapped in/out, or the stream simply arrives late from getUserMedia
    // after a peer connection was already created without it), push the
    // current tracks to every existing peer connection instead of waiting
    // for a brand new connection to be made.
    peersRef.current.forEach(({ connection, user }) => {
      if (!localStream) return;

      let addedNewTrack = false;

      localStream.getTracks().forEach((track) => {
        const sender = connection
          .getSenders()
          .find((s) => s.track?.kind === track.kind);

        if (sender) {
          if (sender.track?.id !== track.id) {
            sender.replaceTrack(track);
          }
        } else {
          // Bug fix: previously we only ever called addTrack() here and
          // never renegotiated. addTrack() after the initial offer/answer
          // exchange fires the connection's `negotiationneeded` event, but
          // nothing was listening for it, so no new offer was ever sent.
          // The remote peer's SDP was never updated to describe this
          // track, so audio/video added after the first connection (e.g.
          // because getUserMedia hadn't resolved yet when we first called
          // the peer) silently never reached them. We now track whether a
          // *new* track (not just a replaced one) was added and, if so,
          // kick off a fresh offer below.
          connection.addTrack(track, localStream);
          addedNewTrack = true;
        }
      });

      if (addedNewTrack) {
        renegotiate(connection, user);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream, renegotiate]);

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
        // eslint-disable-next-line no-console
        console.log(
          "[VirtualMeet debug] ontrack fired for",
          user.socketId,
          "kind:",
          event.track.kind,
          "streams:",
          event.streams.length
        );

        const stream = event.streams[0] ?? null;
        updateRemotePeer(user.socketId, { stream });
      };

      connection.onconnectionstatechange = () => {
        // eslint-disable-next-line no-console
        console.log(
          "[VirtualMeet debug] connectionState for",
          user.socketId,
          "->",
          connection.connectionState
        );

        if (
          connection.connectionState === "failed" ||
          connection.connectionState === "closed" ||
          connection.connectionState === "disconnected"
        ) {
          removePeer(user.socketId);
        }
      };

      connection.oniceconnectionstatechange = () => {
        // eslint-disable-next-line no-console
        console.log(
          "[VirtualMeet debug] iceConnectionState for",
          user.socketId,
          "->",
          connection.iceConnectionState
        );
      };

      peersRef.current.set(user.socketId, { connection, user });

      setRemotePeers((current) => {
        const next = new Map(current);
        next.set(user.socketId, { user, stream: null });
        return next;
      });

      // Flush any ICE candidates that arrived before this connection
      // existed (see pendingCandidatesRef above).
      const pending = pendingCandidatesRef.current.get(user.socketId);

      if (pending && pending.length > 0) {
        pendingCandidatesRef.current.delete(user.socketId);

        pending.forEach((candidate) => {
          connection
            .addIceCandidate(new RTCIceCandidate(candidate))
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error("Failed to add buffered ICE candidate:", error);
            });
        });
      }

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
  //
  // Guarded the same way as renegotiate() above: only start a new
  // offer/answer exchange while the connection is idle ("stable").
  const callPeer = useCallback(
    async (user: RoomUser) => {
      const connection = getOrCreatePeer(user);

      if (connection.signalingState !== "stable") return;

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
      // eslint-disable-next-line no-console
      console.log("[VirtualMeet debug] received offer from", from);

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
      // eslint-disable-next-line no-console
      console.log("[VirtualMeet debug] received answer from", from);

      const entry = peersRef.current.get(from);

      if (!entry) return;

      // Bug fix: an answer can arrive for an offer we're no longer
      // waiting on (e.g. a duplicate/late answer after the connection is
      // already back to "stable" — see the guard added in renegotiate()
      // above, which stops the *cause* of duplicate offers, but a
      // straggling answer already in flight when that fix lands could
      // still show up here once). Applying an answer only makes sense
      // while we're in "have-local-offer"; otherwise silently ignore it
      // instead of letting setRemoteDescription throw.
      if (entry.connection.signalingState !== "have-local-offer") return;

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
      // eslint-disable-next-line no-console
      console.log("[VirtualMeet debug] received ICE candidate from", from);

      const entry = peersRef.current.get(from);

      if (!entry) {
        // Bug fix: this candidate arrived before we created a connection
        // for this peer (a real race — candidates can arrive before our
        // own offer/answer handling finishes). It used to be dropped here
        // silently, which could leave ICE negotiation permanently
        // incomplete (so media never flowed) even on a same-network test
        // where a direct connection should have been trivial. Buffer it
        // and getOrCreatePeer will flush it in once the connection exists.
        const existingPending =
          pendingCandidatesRef.current.get(from) ?? [];
        existingPending.push(candidate);
        pendingCandidatesRef.current.set(from, existingPending);
        return;
      }

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
