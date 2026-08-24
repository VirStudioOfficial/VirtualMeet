"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getMeetingById,
  addParticipant,
  removeParticipant,
} from "@/database/meetings";

import {
  getCurrentUser,
} from "@/services/auth";

import { Meeting } from "@/types/meeting";
import { User } from "@/types/user";

export default function useMeeting(
  roomId: string
) {
  const [meeting, setMeeting] =
    useState<Meeting | null>(null);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [joined, setJoined] =
    useState(false);

  const loadMeeting =
    useCallback(() => {
      const currentUser =
        getCurrentUser();

      setUser(currentUser);

      const currentMeeting =
        getMeetingById(roomId);

      setMeeting(currentMeeting);

      setLoading(false);
    }, [roomId]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const joinMeeting =
    useCallback(() => {
      if (!user || !meeting) {
        return null;
      }

      const updated =
        addParticipant(
          meeting.id,
          user.id
        );

      if (!updated) {
        return null;
      }

      setMeeting(updated);
      setJoined(true);

      return updated;
    }, [user, meeting]);

  const leaveMeeting =
    useCallback(() => {
      if (!user || !meeting) {
        return;
      }

      const updated =
        removeParticipant(
          meeting.id,
          user.id
        );

      setMeeting(updated);
      setJoined(false);
    }, [user, meeting]);

  const refresh =
    useCallback(() => {
      loadMeeting();
    }, [loadMeeting]);

  return {
    meeting,
    user,
    loading,
    joined,
    joinMeeting,
    leaveMeeting,
    refresh,
  };
}
