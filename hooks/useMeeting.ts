import { useCallback, useEffect, useState } from "react";

import { User } from "../types/user";
import { Room } from "../types/room";

interface UseMeetingOptions {
  roomId: string;
  currentUser: User;
}

export function useMeeting({
  roomId,
  currentUser,
}: UseMeetingOptions) {
  const [room, setRoom] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<User[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isHost, setIsHost] = useState(false);

  const joinMeeting = useCallback(() => {
    const existingRoom: Room = {
      id: roomId,
      hostId: currentUser.id,
      participants: [currentUser],
      createdAt: new Date(),
      isLocked: false,
    };

    setRoom(existingRoom);
    setParticipants(existingRoom.participants);
    setIsHost(existingRoom.hostId === currentUser.id);
    setIsConnected(true);
  }, [roomId, currentUser]);

  const leaveMeeting = useCallback(() => {
    setRoom(null);
    setParticipants([]);
    setIsConnected(false);
    setIsHost(false);
  }, []);

  const addParticipant = useCallback((user: User) => {
    setParticipants((current) => {
      const alreadyExists = current.some(
        (participant) => participant.id === user.id
      );

      if (alreadyExists) {
        return current;
      }

      return [...current, user];
    });
  }, []);

  const removeParticipant = useCallback((userId: string) => {
    setParticipants((current) =>
      current.filter((participant) => participant.id !== userId)
    );
  }, []);

  const updateParticipant = useCallback(
    (userId: string, updates: Partial<User>) => {
      setParticipants((current) =>
        current.map((participant) =>
          participant.id === userId
            ? { ...participant, ...updates }
            : participant
        )
      );
    },
    []
  );

  useEffect(() => {
    return () => {
      setRoom(null);
      setParticipants([]);
    };
  }, []);

  return {
    room,
    participants,
    isConnected,
    isHost,
    joinMeeting,
    leaveMeeting,
    addParticipant,
    removeParticipant,
    updateParticipant,
  };
}
