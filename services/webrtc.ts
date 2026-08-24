export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}

const defaultConfig: PeerConnectionConfig = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "stun:stun1.l.google.com:19302",
    },
  ],
};

export function createPeerConnection(
  config: PeerConnectionConfig = defaultConfig
): RTCPeerConnection {
  return new RTCPeerConnection(config);
}

export function addStreamToPeer(
  peer: RTCPeerConnection,
  stream: MediaStream
): void {
  const existingTrackIds = new Set(
    peer
      .getSenders()
      .map((sender) => sender.track?.id)
      .filter(Boolean)
  );

  stream.getTracks().forEach((track) => {
    if (!existingTrackIds.has(track.id)) {
      peer.addTrack(track, stream);
    }
  });
}

export function removeStreamFromPeer(
  peer: RTCPeerConnection,
  stream: MediaStream
): void {
  stream.getTracks().forEach((track) => {
    const sender = peer
      .getSenders()
      .find(
        (item) => item.track?.id === track.id
      );

    if (sender) {
      peer.removeTrack(sender);
    }
  });
}

export async function createOffer(
  peer: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await peer.createOffer();

  await peer.setLocalDescription(offer);

  return offer;
}

export async function createAnswer(
  peer: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const answer = await peer.createAnswer();

  await peer.setLocalDescription(answer);

  return answer;
}

export async function setRemoteDescription(
  peer: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<void> {
  await peer.setRemoteDescription(
    new RTCSessionDescription(description)
  );
}

export async function addIceCandidate(
  peer: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await peer.addIceCandidate(
    new RTCIceCandidate(candidate)
  );
}

export function closePeerConnection(
  peer: RTCPeerConnection
): void {
  peer.getSenders().forEach((sender) => {
    if (sender.track) {
      sender.track.stop();
    }
  });

  peer.close();
}

export function onRemoteTrack(
  peer: RTCPeerConnection,
  callback: (stream: MediaStream) => void
): () => void {
  const handleTrack = (event: RTCTrackEvent) => {
    const [stream] = event.streams;

    if (stream) {
      callback(stream);
    }
  };

  peer.addEventListener("track", handleTrack);

  return () => {
    peer.removeEventListener(
      "track",
      handleTrack
    );
  };
}

export function onIceCandidate(
  peer: RTCPeerConnection,
  callback: (candidate: RTCIceCandidate) => void
): () => void {
  const handleCandidate = (
    event: RTCPeerConnectionIceEvent
  ) => {
    if (event.candidate) {
      callback(event.candidate);
    }
  };

  peer.addEventListener(
    "icecandidate",
    handleCandidate
  );

  return () => {
    peer.removeEventListener(
      "icecandidate",
      handleCandidate
    );
  };
}
