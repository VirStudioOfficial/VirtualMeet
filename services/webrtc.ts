export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}

export const defaultPeerConfig: PeerConnectionConfig = {
  iceServers: [
    {
      urls: [
        "stun:stun.l.google.com:19302",
        "stun:stun1.l.google.com:19302",
        "stun:stun2.l.google.com:19302",
      ],
    },
    // اضافه شدن TURN رایگان جهت برقراری اتصال روی اینترنت همراه و شبکه‌های مختلف
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
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
    // جلوگیری از اضافه کردن ترک تکراری
    const senders = peer.getSenders();
    const alreadyExists = senders.some((s) => s.track?.id === track.id);
    if (!alreadyExists) {
      peer.addTrack(track, stream);
    }
  });
}

export async function createOffer(
  peer: RTCPeerConnection
): Promise<RTCSessionDescriptionInit> {
  const offer = await peer.createOffer({
    offerToReceiveAudio: true,
    offerToReceiveVideo: true,
  });
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

const pendingCandidates = new WeakMap<RTCPeerConnection, RTCIceCandidateInit[]>();

export async function setRemoteDescription(
  peer: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<void> {
  if (peer.signalingState === "closed") return;

  await peer.setRemoteDescription(new RTCSessionDescription(description));

  const queued = pendingCandidates.get(peer);
  if (queued && queued.length > 0) {
    pendingCandidates.set(peer, []);
    for (const candidate of queued) {
      try {
        await peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.warn("Failed to add buffered ICE candidate:", e);
      }
    }
  }
}

export async function addIceCandidate(
  peer: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  if (peer.signalingState === "closed") return;

  if (!peer.remoteDescription || !peer.remoteDescription.type) {
    const queued = pendingCandidates.get(peer) ?? [];
    queued.push(candidate);
    pendingCandidates.set(peer, queued);
    return;
  }

  try {
    await peer.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (e) {
    console.warn("Failed to add ICE candidate directly:", e);
  }
}

export function closePeerConnection(peer: RTCPeerConnection): void {
  if (peer.signalingState !== "closed") {
    peer.onicecandidate = null;
    peer.ontrack = null;
    peer.onconnectionstatechange = null;
    peer.onsignalingstatechange = null;
    peer.close();
  }
}
