"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

export default function useCamera() {
  const [stream, setStream] =
    useState<MediaStream | null>(null);

  const [cameraOff, setCameraOff] =
    useState(false);

  const [muted, setMuted] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);


  const startCamera =
    useCallback(async () => {
      try {
        setError(null);

        const mediaStream =
          await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          });

        setStream(mediaStream);
        setCameraOff(false);
        setMuted(false);

        return mediaStream;

      } catch (err) {
        setError(
          "دسترسی به دوربین یا میکروفون امکان‌پذیر نیست."
        );

        return null;
      }
    }, []);


  const toggleCamera =
    useCallback(() => {
      if (!stream) {
        return;
      }

      const nextState = !cameraOff;

      stream
        .getVideoTracks()
        .forEach((track) => {
          track.enabled = !nextState;
        });

      setCameraOff(nextState);

    }, [stream, cameraOff]);


  const toggleMicrophone =
    useCallback(() => {
      if (!stream) {
        return;
      }

      const nextState = !muted;

      stream
        .getAudioTracks()
        .forEach((track) => {
          track.enabled = !nextState;
        });

      setMuted(nextState);

    }, [stream, muted]);


  const stopCamera =
    useCallback(() => {
      if (!stream) {
        return;
      }

      stream
        .getTracks()
        .forEach((track) =>
          track.stop()
        );

      setStream(null);
      setCameraOff(false);
      setMuted(false);

    }, [stream]);


  useEffect(() => {
    return () => {
      if (stream) {
        stream
          .getTracks()
          .forEach((track) =>
            track.stop()
          );
      }
    };
  }, [stream]);


  return {
    stream,
    cameraOff,
    muted,
    error,
    startCamera,
    stopCamera,
    toggleCamera,
    toggleMicrophone,
  };
}
