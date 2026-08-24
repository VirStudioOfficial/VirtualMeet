"use client";

import { useCallback, useEffect, useState } from "react";

import { getSocket, RoomUser } from "@/services/socket";

interface UseRoomParticipantsOptions {
  meetingId: string;
  currentUser: RoomUser;
}

export default function useRoomParticipants({
  meetingId,
  currentUser,
}: UseRoomParticipantsOptions) {
  const [participants, setParticipants] = useState<RoomUser[]>([currentUser]);

  useEffect(() => {
    setParticipants((current) => {
      const exists = current.some(
        (participant) => participant.id === currentUser.id
      );

      if (exists) {
        return current.map((participant) =>
          participant.id === currentUser.id
            ? { ...participant, ...currentUser }
            : participant
        );
      }

      return [...current, currentUser];
    });
    // meetingId is intentionally not a dependency here: it's only used by
    // the socket-event effect below to scope incoming events to this room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  useEffect(() => {
    const socket = getSocket();

    const handleJoined = (user: RoomUser) => {
      setParticipants((current) => {
        if (current.some((participant) => participant.id === user.id)) {
          return current;
        }

        return [...current, user];
      });
    };

    const handleLeft = ({ socketId }: { socketId: string }) => {
      setParticipants((current) =>
        current.filter((participant) => participant.socketId !== socketId)
      );
    };

    const handleUpdated = (user: RoomUser) => {
      setParticipants((current) =>
        current.map((participant) =>
          participant.id === user.id ? { ...participant, ...user } : participant
        )
      );
    };

    socket.on("participant-joined", handleJoined);
    socket.on("participant-left", handleLeft);
    socket.on("participant-updated", handleUpdated);

    return () => {
      socket.off("participant-joined", handleJoined);
      socket.off("participant-left", handleLeft);
      socket.off("participant-updated", handleUpdated);
    };
  }, [meetingId]);

  const addParticipant = useCallback((participant: RoomUser) => {
    setParticipants((current) => {
      if (current.some((item) => item.id === participant.id)) {
        return current;
      }

      return [...current, participant];
    });
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    setParticipants((current) =>
      current.filter((participant) => participant.id !== userId)
    );
  }, []);

  const updateParticipant = useCallback(
    (userId: string, updates: Partial<RoomUser>) => {
      setParticipants((current) =>
        current.map((participant) =>
          participant.id === userId ? { ...participant, ...updates } : participant
        )
      );
    },
    []
  );

  return {
    participants,
    addParticipant,
    removeParticipant,
    updateParticipant,
  };
}
