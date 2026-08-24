"use client";

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

export const defaultWebRTCConfig: WebRTCConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

export function createPeerConnection(
  config: WebRTCConfig = defaultWebRTCConfig
): RTCPeerConnection {
  return new RTCPeerConnection(config);
}

export function addStreamToPeer(
  peer: RTCPeerConnection,
  stream: MediaStream
): void {
  stream.getTracks().forEach((track) => {
    const alreadyAdded = peer
      .getSenders()
      .some(
        (sender) =>
          sender.track?.id === track.id
      );

    if (!alreadyAdded) {
      peer.addTrack(track, stream);
    }
  });
}

export function closePeerConnection(
  peer: RTCPeerConnection | null
): void {
  if (!peer) {
    return;
  }

  peer.onicecandidate = null;
  peer.ontrack = null;
  peer.onconnectionstatechange = null;
  peer.close();
}
