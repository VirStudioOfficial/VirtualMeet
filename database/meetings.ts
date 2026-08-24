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
    const parsed = JSON.parse(stored) as Array<
      Omit<Meeting, "createdAt"> & {
        createdAt: string;
      }
    >;

    return parsed.map((meeting) => ({
      ...meeting,
      createdAt: new Date(meeting.createdAt),
    }));
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

export function createMeeting(
  meeting: Meeting
): Meeting {
  const meetings = getMeetings();

  const existing = meetings.find(
    (item) =>
      item.id === meeting.id ||
      item.roomId === meeting.roomId
  );

  if (existing) {
    return existing;
  }

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
    (meeting) =>
      meeting.id === id ||
      meeting.roomId === id
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

export function deleteMeeting(id: string): boolean {
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

  if (!meeting) {
    return null;
  }

  if (!meeting.participants.includes(userId)) {
    meeting.participants.push(userId);
  }

  return updateMeeting(meeting.id, {
    participants: meeting.participants,
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

  const participants = meeting.participants.filter(
    (id) => id !== userId
  );

  return updateMeeting(meeting.id, {
    participants,
  });
}
