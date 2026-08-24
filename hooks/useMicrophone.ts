"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useMicrophone() {
  const streamRef = useRef<MediaStream | null>(null);

  const [isMicrophoneOn, setIsMicrophoneOn] =
    useState(false);
  const [error, setError] = useState("");

  const startMicrophone = useCallback(async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError(
          "دسترسی به میکروفون در این مرورگر وجود ندارد."
        );
        return false;
      }

      if (streamRef.current) {
        return true;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          audio: true,
        });

      streamRef.current = stream;

      const audioTrack = stream.getAudioTracks()[0];

      if (!audioTrack) {
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        setError("میکروفون پیدا نشد.");
        return false;
      }

      audioTrack.enabled = true;
      setIsMicrophoneOn(true);

      return true;
    } catch {
      setIsMicrophoneOn(false);
      setError("دسترسی به میکروفون امکان‌پذیر نیست.");
      return false;
    }
  }, []);

  const stopMicrophone = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    setIsMicrophoneOn(false);
  }, []);

  const toggleMicrophone = useCallback(async () => {
    if (!streamRef.current) {
      return startMicrophone();
    }

    const audioTrack =
      streamRef.current.getAudioTracks()[0];

    if (!audioTrack) {
      return startMicrophone();
    }

    const nextState = !audioTrack.enabled;

    audioTrack.enabled = nextState;
    setIsMicrophoneOn(nextState);

    return nextState;
  }, [startMicrophone]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, []);

  return {
    stream: streamRef.current,
    isMicrophoneOn,
    error,
    startMicrophone,
    stopMicrophone,
    toggleMicrophone,
  };
}
