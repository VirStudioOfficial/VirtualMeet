"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setError("");

      if (!navigator.mediaDevices?.getUserMedia) {
        setError("دسترسی به دوربین در این مرورگر وجود ندارد.");
        return false;
      }

      if (streamRef.current) {
        return true;
      }

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      setIsCameraOn(true);

      return true;
    } catch {
      setIsCameraOn(false);
      setError("دسترسی به دوربین امکان‌پذیر نیست.");
      return false;
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current
        .getTracks()
        .forEach((track) => track.stop());

      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  const toggleCamera = useCallback(async () => {
    if (!streamRef.current) {
      return startCamera();
    }

    const videoTrack =
      streamRef.current.getVideoTracks()[0];

    if (!videoTrack) {
      return startCamera();
    }

    const nextState = !videoTrack.enabled;

    videoTrack.enabled = nextState;
    setIsCameraOn(nextState);

    return nextState;
  }, [startCamera]);

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
    videoRef,
    stream: streamRef.current,
    isCameraOn,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
  };
}
