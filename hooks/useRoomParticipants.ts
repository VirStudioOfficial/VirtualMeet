"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  socket,
  socketEvents,
} from "@/services/socket";

export interface RoomParticipant {
  id: string;
  username: string;
  muted: boolean;
  cameraOff: boolean;
  stream?: MediaStream | null;
}

interface ParticipantEvent {
  meetingId: string;
  participant: RoomParticipant;
}

interface UseRoomParticipantsOptions {
  meetingId: string;
  currentUser: RoomParticipant;
}

export default function useRoomParticipants({
  meetingId,
  currentUser,
}: UseRoomParticipantsOptions) {
  const [participants, setParticipants] =
    useState<RoomParticipant[]>([
      currentUser,
    ]);

  useEffect(() => {
    setParticipants((current) => {
      const exists = current.some(
        (participant) =>
          participant.id === currentUser.id
      );

      if (exists) {
        return current.map((participant) =>
          participant.id === currentUser.id
            ? {
                ...participant,
                ...currentUser,
              }
            : participant
        );
      }

      return [...current, currentUser];
    });
  }, [currentUser]);

  useEffect(() => {
    const unsubscribeJoined =
      socket.on(
        socketEvents.USER_JOINED,
        (data) => {
          const event =
            data as ParticipantEvent;

          if (
            event.meetingId !== meetingId
          ) {
            return;
          }

          setParticipants((current) => {
            const exists = current.some(
              (participant) =>
                participant.id ===
                event.participant.id
            );

            if (exists) {
              return current;
            }

            return [
              ...current,
              event.participant,
            ];
          });
        }
      );

    const unsubscribeLeft =
      socket.on(
        socketEvents.USER_LEFT,
        (data) => {
          const event =
            data as ParticipantEvent;

          if (
            event.meetingId !== meetingId
          ) {
            return;
          }

          setParticipants((current) =>
            current.filter(
              (participant) =>
                participant.id !==
                event.participant.id
            )
          );
        }
      );

    const unsubscribeUpdated =
      socket.on(
        socketEvents.STREAM_UPDATED,
        (data) => {
          const event =
            data as ParticipantEvent;

          if (
            event.meetingId !== meetingId
          ) {
            return;
          }

          setParticipants((current) =>
            current.map((participant) =>
              participant.id ===
              event.participant.id
                ? {
                    ...participant,
                    ...event.participant,
                  }
                : participant
            )
          );
        }
      );

    return () => {
      unsubscribeJoined();
      unsubscribeLeft();
      unsubscribeUpdated();
    };
  }, [meetingId]);

  const addParticipant =
    useCallback(
      (participant: RoomParticipant) => {
        setParticipants((current) => {
          if (
            current.some(
              (item) =>
                item.id === participant.id
            )
          ) {
            return current;
          }

          return [
            ...current,
            participant,
          ];
        });
      },
      []
    );

  const removeParticipant =
    useCallback((userId: string) => {
      setParticipants((current) =>
        current.filter(
          (participant) =>
            participant.id !== userId
        )
      );
    }, []);

  const updateParticipant =
    useCallback(
      (
        userId: string,
        updates: Partial<RoomParticipant>
      ) => {
        setParticipants((current) =>
          current.map((participant) =>
            participant.id === userId
              ? {
                  ...participant,
                  ...updates,
                }
              : participant
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
