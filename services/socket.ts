import { io, Socket } from "socket.io-client";

import { config } from "../lib/config";

export interface RoomUser {
  socketId: string;
  id: string;
  username: string;
  isHost: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
}

export interface ChatMessagePayload {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

interface ServerToClientEvents {
  "room-joined": (payload: {
    self: RoomUser;
    participants: RoomUser[];
  }) => void;
  "participant-joined": (user: RoomUser) => void;
  "participant-left": (payload: { socketId: string }) => void;
  "participant-updated": (user: RoomUser) => void;
  "webrtc-offer": (payload: {
    from: string;
    offer: RTCSessionDescriptionInit;
  }) => void;
  "webrtc-answer": (payload: {
    from: string;
    answer: RTCSessionDescriptionInit;
  }) => void;
  "webrtc-ice-candidate": (payload: {
    from: string;
    candidate: RTCIceCandidateInit;
  }) => void;
  "chat-message": (message: ChatMessagePayload) => void;
  "error-message": (payload: { message: string }) => void;
}

interface ClientToServerEvents {
  "join-room": (payload: {
    roomId: string;
    user: { id: string; username: string };
  }) => void;
  "leave-room": () => void;
  "webrtc-offer": (payload: {
    to: string;
    offer: RTCSessionDescriptionInit;
  }) => void;
  "webrtc-answer": (payload: {
    to: string;
    answer: RTCSessionDescriptionInit;
  }) => void;
  "webrtc-ice-candidate": (payload: {
    to: string;
    candidate: RTCIceCandidateInit;
  }) => void;
  "update-status": (payload: {
    isMuted?: boolean;
    isCameraOff?: boolean;
  }) => void;
  "chat-message": (message: ChatMessagePayload) => void;
}

export type VirtualMeetSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

let socket: VirtualMeetSocket | null = null;

/**
 * Returns a singleton socket.io connection to the signaling server.
 * The connection is created lazily and reused across the app so we don't
 * open multiple sockets when several components call this on mount.
 */
export function getSocket(): VirtualMeetSocket {
  if (!socket) {
    const url = config.socket.url || "http://localhost:3001";

    socket = io(url, {
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }

  return socket;
}

export function connectSocket(): VirtualMeetSocket {
  const s = getSocket();

  if (!s.connected) {
    s.connect();
  }

  return s;
}

export function disconnectSocket(): void {
  if (!socket) return;

  // Fully tear the socket down instead of just calling .disconnect() and
  // leaving the module-level reference pointing at a dead socket object.
  // Reusing a disconnected socket (getSocket() would have returned this
  // same stale instance next time) meant reconnecting could hand out a
  // new server-side socket.id while old event listeners / in-flight
  // events from the previous connection were still attached, which is
  // what caused the phantom duplicate self-tile and calls going to a
  // socket id the server no longer recognized (so media never arrived).
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
