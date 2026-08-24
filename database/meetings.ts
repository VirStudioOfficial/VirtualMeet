import { Meeting } from "../types/meeting";

const MEETINGS_KEY = "virtual-meet-meetings";

function getMeetings(): Meeting[] {
  if (typeof window === "undefined") {
    return [];
  }

  const stored = localStorage.getItem(MEETINGS_KEY);

  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Meeting[];
  } catch {
    return [];
  }
}

function saveMeetings(meetings: Meeting[]): void {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(
    MEETINGS_KEY,
    JSON.stringify(meetings)
  );
}

export function getAllMeetings(): Meeting[] {
  return getMeetings();
}

export function getMeetingById(
  id: string
): Meeting | null {
  return (
    getMeetings().find(
      (meeting) =>
        meeting.id === id ||
        meeting.roomId === id
    ) ?? null
  );
}

export function createMeeting(data: {
  title: string;
  hostId: string;
}): Meeting {
  const meetings = getMeetings();

  const meeting: Meeting = {
    id: crypto.randomUUID(),
    roomId: generateRoomId(),
    title: data.title.trim() || "جلسه جدید",
    hostId: data.hostId,
    participants: [],
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  meetings.push(meeting);
  saveMeetings(meetings);

  return meeting;
}

export function updateMeeting(
  id: string,
  updates: Partial<Meeting>
): Meeting | null {
  const meetings = getMeetings();

  const index = meetings.findIndex(
    (meeting) => meeting.id === id
  );

  if (index === -1) {
    return null;
  }

  meetings[index] = {
    ...meetings[index],
    ...updates,
  };

  saveMeetings(meetings);

  return meetings[index];
}

export function deleteMeeting(
  id: string
): boolean {
  const meetings = getMeetings();

  const filtered = meetings.filter(
    (meeting) =>
      meeting.id !== id &&
      meeting.roomId !== id
  );

  if (filtered.length === meetings.length) {
    return false;
  }

  saveMeetings(filtered);

  return true;
}

export function addParticipant(
  meetingId: string,
  userId: string
): Meeting | null {
  const meeting = getMeetingById(meetingId);

  if (!meeting || !meeting.isActive) {
    return null;
  }

  if (meeting.participants.includes(userId)) {
    return meeting;
  }

  return updateMeeting(meeting.id, {
    participants: [
      ...meeting.participants,
      userId,
    ],
  });
}

export function removeParticipant(
  meetingId: string,
  userId: string
): Meeting | null {
  const meeting = getMeetingById(meetingId);

  if (!meeting) {
    return null;
  }

  return updateMeeting(meeting.id, {
    participants: meeting.participants.filter(
      (id) => id !== userId
    ),
  });
}

function generateRoomId(): string {
  return Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
}
