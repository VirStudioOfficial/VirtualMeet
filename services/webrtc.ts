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

// ICE candidates can arrive over the socket before setRemoteDescription
// has resolved (the offer/answer round trip and the ICE relay race each
// other). Calling addIceCandidate before a remote description exists
// throws and the candidate is lost, which can prevent the connection
// from ever completing — media (camera/mic/screen) then never appears
// for the remote side. We buffer early candidates per-connection and
// flush them once the remote description is in place.
const pendingCandidates = new WeakMap<RTCPeerConnection, RTCIceCandidateInit[]>();

export async function setRemoteDescription(
  peer: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<void> {
  await peer.setRemoteDescription(
    new RTCSessionDescription(description)
  );

  const queued = pendingCandidates.get(peer);

  if (queued && queued.length > 0) {
    pendingCandidates.set(peer, []);

    for (const candidate of queued) {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }
}

export async function addIceCandidate(
  peer: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  if (!peer.remoteDescription) {
    const queued = pendingCandidates.get(peer) ?? [];
    queued.push(candidate);
    pendingCandidates.set(peer, queued);
    return;
  }

  await peer.addIceCandidate(new RTCIceCandidate(candidate));
}

export function closePeerConnection(
  peer: RTCPeerConnection
): void {
  // Do NOT stop sender tracks here: the same local camera/mic tracks are
  // shared across every peer connection. Stopping them when closing one
  // connection (e.g. one participant leaving) would silently kill your
  // camera/mic for everyone else still in the call. Track lifecycle is
  // owned by whoever created the MediaStream (the room page), not by
  // individual peer connections.
  peer.close();
}
