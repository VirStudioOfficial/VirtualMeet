export const config = {
  app: {
    name: "Virtual Meet",
    version: "1.0.0",
    description: "Online meeting platform",
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "",
  },

  socket: {
    url: process.env.NEXT_PUBLIC_SOCKET_URL || "",
  },

  webrtc: {
    iceServers: [
      {
        urls: "stun:stun.l.google.com:19302",
      },
      {
        urls: "stun:stun1.l.google.com:19302",
      },
    ],
  },

  meeting: {
    maxParticipants: 100,
    defaultTitle: "Virtual Meeting",
  },

  storage: {
    user: "virtual-meet-user",
    token: "virtual-meet-token",
    meetings: "virtual-meet-meetings",
    messages: "virtual-meet-messages",
  },
} as const;
