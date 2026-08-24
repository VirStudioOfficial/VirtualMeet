import http from "http";

import cors from "cors";
import express from "express";
import { Server, Socket } from "socket.io";

import { ChatMessagePayload, RoomUser } from "./types.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN }));
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ["GET", "POST"],
  },
});

// roomId -> Map<socketId, RoomUser>
const rooms = new Map<string, Map<string, RoomUser>>();

function getOrCreateRoom(roomId: string): Map<string, RoomUser> {
  let room = rooms.get(roomId);

  if (!room) {
    room = new Map();
    rooms.set(roomId, room);
  }

  return room;
}

function participantsOf(roomId: string): RoomUser[] {
  return Array.from(rooms.get(roomId)?.values() ?? []);
}

io.on("connection", (socket: Socket) => {
  let currentRoomId: string | null = null;

  socket.on(
    "join-room",
    (payload: { roomId: string; user: { id: string; username: string } }) => {
      const { roomId, user } = payload;

      if (!roomId || !user?.id) {
        socket.emit("error-message", { message: "roomId and user are required" });
        return;
      }

      const room = getOrCreateRoom(roomId);
      const isHost = room.size === 0;

      const roomUser: RoomUser = {
        socketId: socket.id,
        id: user.id,
        username: user.username || "Guest",
        isHost,
        isMuted: false,
        isCameraOff: false,
      };

      room.set(socket.id, roomUser);
      socket.join(roomId);
      currentRoomId = roomId;

      // Tell the newcomer who is already here
      socket.emit("room-joined", {
        self: roomUser,
        participants: participantsOf(roomId).filter(
          (p) => p.socketId !== socket.id
        ),
      });

      // Tell everyone else a new participant joined
      socket.to(roomId).emit("participant-joined", roomUser);
    }
  );

  // --- WebRTC signaling relay (offer / answer / ICE candidates) ---
  // These are relayed 1:1 between two socket IDs; the server never inspects
  // the SDP/ICE payloads, it just routes them to the right peer.

  socket.on(
    "webrtc-offer",
    (payload: { to: string; offer: RTCSessionDescriptionInit }) => {
      io.to(payload.to).emit("webrtc-offer", {
        from: socket.id,
        offer: payload.offer,
      });
    }
  );

  socket.on(
    "webrtc-answer",
    (payload: { to: string; answer: RTCSessionDescriptionInit }) => {
      io.to(payload.to).emit("webrtc-answer", {
        from: socket.id,
        answer: payload.answer,
      });
    }
  );

  socket.on(
    "webrtc-ice-candidate",
    (payload: { to: string; candidate: RTCIceCandidateInit }) => {
      io.to(payload.to).emit("webrtc-ice-candidate", {
        from: socket.id,
        candidate: payload.candidate,
      });
    }
  );

  // --- Presence updates (mute / camera toggle) ---

  socket.on(
    "update-status",
    (payload: { isMuted?: boolean; isCameraOff?: boolean }) => {
      if (!currentRoomId) return;

      const room = rooms.get(currentRoomId);
      const user = room?.get(socket.id);

      if (!room || !user) return;

      if (typeof payload.isMuted === "boolean") {
        user.isMuted = payload.isMuted;
      }

      if (typeof payload.isCameraOff === "boolean") {
        user.isCameraOff = payload.isCameraOff;
      }

      io.to(currentRoomId).emit("participant-updated", user);
    }
  );

  // --- Chat ---

  socket.on("chat-message", (message: ChatMessagePayload) => {
    if (!currentRoomId) return;

    io.to(currentRoomId).emit("chat-message", message);
  });

  // --- Leave / disconnect ---

  function leaveCurrentRoom() {
    if (!currentRoomId) return;

    const room = rooms.get(currentRoomId);
    room?.delete(socket.id);

    socket.to(currentRoomId).emit("participant-left", { socketId: socket.id });

    if (room && room.size === 0) {
      rooms.delete(currentRoomId);
    } else if (room) {
      // If the host left, promote the next participant
      const stillHasHost = Array.from(room.values()).some((p) => p.isHost);

      if (!stillHasHost) {
        const next = room.values().next().value as RoomUser | undefined;

        if (next) {
          next.isHost = true;
          io.to(currentRoomId).emit("participant-updated", next);
        }
      }
    }

    socket.leave(currentRoomId);
    currentRoomId = null;
  }

  socket.on("leave-room", leaveCurrentRoom);
  socket.on("disconnect", leaveCurrentRoom);
});

httpServer.listen(PORT, () => {
  console.log(`Signaling server listening on port ${PORT}`);
});
