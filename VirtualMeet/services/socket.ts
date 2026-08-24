export interface SocketMessage {
  type: string;
  roomId?: string;
  senderId?: string;
  data?: unknown;
}

type MessageHandler = (message: SocketMessage) => void;

class VirtualSocket {
  private socket: WebSocket | null = null;
  private handlers: Set<MessageHandler> = new Set();

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        resolve();
      };

      this.socket.onerror = () => {
        reject(new Error("WebSocket connection failed"));
      };

      this.socket.onmessage = (event) => {
        try {
          const message: SocketMessage = JSON.parse(event.data);

          this.handlers.forEach((handler) => {
            handler(message);
          });
        } catch {
          console.error("Invalid socket message");
        }
      };

      this.socket.onclose = () => {
        this.socket = null;
      };
    });
  }

  send(message: SocketMessage): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.warn("Socket is not connected");
      return;
    }

    this.socket.send(JSON.stringify(message));
  }

  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);

    return () => {
      this.handlers.delete(handler);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.handlers.clear();
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export const virtualSocket = new VirtualSocket();
