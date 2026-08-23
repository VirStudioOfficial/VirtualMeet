export const APP_NAME = "Virtual Meet";

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  create: "/create",
  join: "/join",
  meetings: "/meetings",
  profile: "/profile",
  settings: "/settings",
  lobby: "/Lobby",
} as const;

export const MEETING = {
  MAX_PARTICIPANTS: 100,
  DEFAULT_TITLE: "Virtual Meeting",
  ID_LENGTH: 8,
} as const;

export const SOCKET_EVENTS = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  OFFER: "offer",
  ANSWER: "answer",
  ICE_CANDIDATE: "ice-candidate",
  MESSAGE: "message",
  PARTICIPANT_UPDATED: "participant-updated",
  SCREEN_SHARE_STARTED: "screen-share-started",
  SCREEN_SHARE_STOPPED: "screen-share-stopped",
} as const;

export const STORAGE_KEYS = {
  USER: "virtual-meet-user",
  TOKEN: "virtual-meet-token",
  MEETINGS: "virtual-meet-meetings",
  MESSAGES: "virtual-meet-messages",
} as const;

export const MEDIA_CONSTRAINTS = {
  CAMERA: {
    video: true,
    audio: false,
  },
  MICROPHONE: {
    video: false,
    audio: true,
  },
  CAMERA_AND_MICROPHONE: {
    video: true,
    audio: true,
  },
} as const;
