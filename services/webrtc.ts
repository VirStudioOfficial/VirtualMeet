export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}

export const defaultPeerConfig: PeerConnectionConfig = {
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
  config: PeerConnectionConfig = defaultPeerConfig
): RTCPeerConnection {
  return new RTCPeerConnection(config);
}

export function addStreamToPeer(
  peer: RTCPeerConnection,
  stream: MediaStream
): void {
  stream.getTracks().forEach((track) => {
    peer.addTrack(track, stream);
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
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
}

export function closePeerConnection(
  peer: RTCPeerConnection
): void {
  peer.getSenders().forEach((sender) => {
    sender.track?.stop();
  });

  peer.close();
}
