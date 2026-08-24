"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getMeetingById,
  addParticipant,
  removeParticipant,
  updateMeeting,
} from "../database/meetings";

import { getCurrentUser } from "../services/auth";
import { Meeting } from "../types/meeting";

export function useMeeting(roomId: string) {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeeting = useCallback(() => {
    setLoading(true);
    setError("");

    const foundMeeting = getMeetingById(roomId);

    if (!foundMeeting) {
      setMeeting(null);
      setError("این اتاق وجود ندارد.");
      setLoading(false);
      return null;
    }

    setMeeting(foundMeeting);
    setLoading(false);

    return foundMeeting;
  }, [roomId]);

  useEffect(() => {
    loadMeeting();
  }, [loadMeeting]);

  const joinMeeting = useCallback(() => {
    const user = getCurrentUser();

    if (!user) {
      setError("برای ورود به جلسه باید وارد حساب شوید.");
      return false;
    }

    const foundMeeting = getMeetingById(roomId);

    if (!foundMeeting) {
      setError("این اتاق وجود ندارد.");
      return false;
    }

    const updatedMeeting = addParticipant(
      roomId,
      user.id
    );

    if (!updatedMeeting) {
      setError("ورود به جلسه انجام نشد.");
      return false;
    }

    setMeeting(updatedMeeting);
    setError("");

    return true;
  }, [roomId]);

  const leaveMeeting = useCallback(() => {
    const user = getCurrentUser();

    if (!user) {
      return false;
    }

    const updatedMeeting = removeParticipant(
      roomId,
      user.id
    );

    if (!updatedMeeting) {
      return false;
    }

    setMeeting(updatedMeeting);

    return true;
  }, [roomId]);

  const endMeeting = useCallback(() => {
    const user = getCurrentUser();

    if (!user || !meeting) {
      return false;
    }

    if (meeting.hostId !== user.id) {
      setError("فقط سازنده جلسه می‌تواند آن را پایان دهد.");
      return false;
    }

    const updatedMeeting = updateMeeting(
      meeting.id,
      {
        isActive: false,
      }
    );

    if (!updatedMeeting) {
      setError("پایان جلسه انجام نشد.");
      return false;
    }

    setMeeting(updatedMeeting);
    setError("");

    return true;
  }, [meeting]);

  return {
    meeting,
    loading,
    error,
    isHost:
      meeting !== null &&
      getCurrentUser()?.id === meeting.hostId,
    participantCount:
      meeting?.participants.length ?? 0,
    loadMeeting,
    joinMeeting,
    leaveMeeting,
    endMeeting,
  };
}
