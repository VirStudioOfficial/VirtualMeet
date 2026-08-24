"use client";

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  bundlePolicy?: RTCBundlePolicy;
  rtcpMuxPolicy?: RTCRtcpMuxPolicy;
  iceCandidatePoolSize?: number;
}

// چرا این بخش لازم است:
// وقتی هر دو نفر روی یک شبکه‌ی محلی باشند، اتصال مستقیم (P2P) با کمک STUN
// به‌راحتی برقرار می‌شود. اما وقتی طرف مقابل روی یک شبکه‌ی دیگر باشد (موبایل،
// تبلت، اینترنت خانه‌ی دیگر و ...)، اغلب پشت یک NAT/فایروال محدودکننده
// (Symmetric NAT) قرار دارد که اتصال مستقیم را اصلاً اجازه نمی‌دهد. در آن حالت
// مرورگر مجبور است ترافیک صوت/تصویر را از یک سرور TURN رله کند. بدون TURN،
// این‌جور تماس‌ها همیشه ناموفق می‌مانند (media سیاه/بی‌صدا می‌ماند حتی وقتی
// signaling و participants list درست کار می‌کنند) — دقیقاً همان رفتاری که در
// VirtualMeet دیده می‌شد.
//
// از همان سرویس رایگان OpenRelay استفاده شده که در پروژه‌ی مسنجر هم امتحان
// و تأیید شده. برای استفاده‌ی جدی/تولیدی بهتر است یک TURN اختصاصی (Twilio,
// Cloudflare Calls, Metered.ca, یا coturn شخصی) جایگزین آن شود.
export const defaultWebRTCConfig: WebRTCConfig = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // TURN over UDP — سریع‌ترین حالت وقتی UDP باز باشد.
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    // TURN over TCP — برای شبکه‌هایی که UDP را می‌بندند (شبکه‌های موبایل/شرکتی).
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    // TURN روی پورت 443 با TLS — سخت‌گیرانه‌ترین حالت فایروال.
    {
      urls: "turns:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  bundlePolicy: "max-bundle",
  rtcpMuxPolicy: "require",
  iceCandidatePoolSize: 10,
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
