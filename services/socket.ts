"use client";

type EventCallback = (
  data: unknown
) => void;


interface SocketEvents {
  [event: string]: EventCallback[];
}


class VirtualSocket {
  private events: SocketEvents = {};


  on(
    event: string,
    callback: EventCallback
  ) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push(callback);


    return () => {
      this.events[event] =
        this.events[event]?.filter(
          (item) =>
            item !== callback
        ) ?? [];
    };
  }


  emit(
    event: string,
    data?: unknown
  ) {
    const listeners =
      this.events[event];


    if (!listeners) {
      return;
    }


    listeners.forEach(
      (callback) => {
        callback(data);
      }
    );
  }


  removeAllListeners(
    event?: string
  ) {
    if (event) {
      delete this.events[event];
      return;
    }


    this.events = {};
  }
}


export const socket =
  new VirtualSocket();



export const socketEvents = {
  USER_JOINED:
    "user_joined",

  USER_LEFT:
    "user_left",

  MESSAGE_SENT:
    "message_sent",

  STREAM_UPDATED:
    "stream_updated",

  ROOM_UPDATED:
    "room_updated",
};
