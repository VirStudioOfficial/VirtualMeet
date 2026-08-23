import { useCallback, useEffect, useRef, useState } from "react";

export function useMicrophone() {
  const streamRef = useRef<MediaStream | null>(null);

  const [isMicrophoneOn, setIsMicrophoneOn] = useState(false);
  const [error, setError] = useState("");

  const startMicrophone = useCallback(async () => {
    try {
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      streamRef.current = stream;

      setIsMicrophoneOn(true);
    } catch {
      setError("دسترسی به میکروفون امکان‌پذیر نیست.");
      setIsMicrophoneOn(false);
    }
  }, []);

  const toggleMicrophone = useCallback(() => {
    const track = streamRef.current?.getAudioTracks()[0];

    if (!track) {
      return;
    }

    track.enabled = !track.enabled;
    setIsMicrophoneOn(track.enabled);
  }, []);

  const stopMicrophone = useCallback(() => {
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
    setIsMicrophoneOn(false);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => {
        track.stop();
      });
    };
  }, []);

  return {
    stream: streamRef.current,
    isMicrophoneOn,
    error,
    startMicrophone,
    toggleMicrophone,
    stopMicrophone,
  };
}
