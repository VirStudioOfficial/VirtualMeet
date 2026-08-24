"use client";

export interface SocketMessage<T = unknown> {
  type: string;
  roomId: string;
  senderId?: string;
  data?: T;
}

type MessageHandler<T = unknown> = (
  message: SocketMessage<T>
) => void;

export class MeetSocket {
  private socket: WebSocket | null = null;
  private handlers = new Map<
    string,
    Set<MessageHandler>
  >();

  private url: string;

  constructor(url?: string) {
    this.url =
      url ||
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      "ws://localhost:3001";
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      const socket = new WebSocket(this.url);

      this.socket = socket;

      socket.onopen = () => {
        resolve();
      };

      socket.onerror = () => {
        reject(
          new Error("اتصال به سرور Socket برقرار نشد.")
        );
      };

      socket.onmessage = (event) => {
        try {
          const message =
            JSON.parse(event.data) as SocketMessage;

          const handlers = this.handlers.get(
            message.type
          );

          handlers?.forEach((handler) => {
            handler(message);
          });
        } catch {
          console.error(
            "Invalid socket message received."
          );
        }
      };

      socket.onclose = () => {
        this.socket = null;
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  send<T>(
    message: SocketMessage<T>
  ): boolean {
    if (
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      return false;
    }

    this.socket.send(
      JSON.stringify(message)
    );

    return true;
  }

  on<T = unknown>(
    type: string,
    handler: MessageHandler<T>
  ): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(
        type,
        new Set()
      );
    }

    this.handlers
      .get(type)!
      .add(handler as MessageHandler);

    return () => {
      this.handlers
        .get(type)
        ?.delete(handler as MessageHandler);
    };
  }

  joinRoom(
    roomId: string,
    senderId: string
  ): boolean {
    return this.send({
      type: "join-room",
      roomId,
      senderId,
    });
  }

  leaveRoom(
    roomId: string,
    senderId: string
  ): boolean {
    return this.send({
      type: "leave-room",
      roomId,
      senderId,
    });
  }

  sendOffer(
    roomId: string,
    senderId: string,
    offer: RTCSessionDescriptionInit
  ): boolean {
    return this.send({
      type: "offer",
      roomId,
      senderId,
      data: offer,
    });
  }

  sendAnswer(
    roomId: string,
    senderId: string,
    answer: RTCSessionDescriptionInit
  ): boolean {
    return this.send({
      type: "answer",
      roomId,
      senderId,
      data: answer,
    });
  }

  sendIceCandidate(
    roomId: string,
    senderId: string,
    candidate: RTCIceCandidateInit
  ): boolean {
    return this.send({
      type: "ice-candidate",
      roomId,
      senderId,
      data: candidate,
    });
  }
}

export const socket = new MeetSocket();
