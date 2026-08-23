import { useCallback, useEffect, useRef, useState } from "react";

export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState("");

  const startCamera = useCallback(async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setIsCameraOn(true);
    } catch {
      setError("دسترسی به دوربین امکان‌پذیر نیست.");
      setIsCameraOn(false);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const track = streamRef.current?.getVideoTracks()[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setIsCameraOn(track.enabled);
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return {
    videoRef,
    stream: streamRef.current,
    isCameraOn,
    error,
    startCamera,
    toggleCamera,
    stopCamera,
  };
}
