export type FriendStatusChangeEvent = {
  type: "friend_status_change";
  user_id: number;
  status: "online" | "offline";
};

export type UserTypingEvent = {
  type: "user_typing";
  user_id: number;
  is_typing: boolean;
};

export type OnlineFriendsEvent = {
  type: "online_friends";
  friends: number[];
};

export type NewConversationEvent = {
  type: "new_conversation";
  conversation_id: number;
  other_user_id: number;
};

export type NewMessageEvent =
  | {
      type: "new_message";
      message_id: number;
      sender_id: number;
      receiver_id: number;
      content: string;
      timestamp: string;
    }
  | {
      type: "new_message";
      conversation_id: number;
      message_id: number;
      sender_id: number;
      content: string;
      created_at: string;
      media_ids: number[];
    };

export type DeleteMessageEvent = { type: "delete_message"; message_id: number };
export type MessagesReadEvent = {
  type: "messages_read";
  conversation_id: number;
  user_id: number;
};
export type ConversationDeletedEvent = {
  type: "conversation_deleted";
  conversation_id: number;
};
export type NewFriendRequestEvent = {
  type: "new_friend_request";
  sender_id: number;
  sender_username: string;
};
export type FriendRequestAcceptedEvent = {
  type: "friend_request_accepted";
  friend_id: number;
  friend_username: string;
};

export type WsEvent =
  | FriendStatusChangeEvent
  | UserTypingEvent
  | OnlineFriendsEvent
  | NewConversationEvent
  | NewMessageEvent
  | DeleteMessageEvent
  | MessagesReadEvent
  | ConversationDeletedEvent
  | NewFriendRequestEvent
  | FriendRequestAcceptedEvent
  | { type: string; [k: string]: any };

type Listener = (evt: WsEvent) => void;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export class SpravaWebsocket {
  private ws: WebSocket | null = null;
  private token: string | null = null;
  private listeners = new Set<Listener>();

  private shouldReconnect = true;
  private connecting: Promise<void> | null = null;
  private retry = 0;

  setToken(token: string | null) {
    this.token = token;
  }

  on(fn: Listener) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(evt: WsEvent) {
    for (const fn of this.listeners) fn(evt);
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  disconnect() {
    this.shouldReconnect = false;
    this.retry = 0;
    try {
      this.ws?.close();
    } catch {}
    this.ws = null;
  }

  async connect() {
    if (!this.token) return;
    if (this.connecting) return this.connecting;

    this.shouldReconnect = true;

    this.connecting = (async () => {
      while (this.shouldReconnect && this.token) {
        const wsUrl = this.buildWsUrl(this.token);

        try {
          await this.open(wsUrl);
          this.retry = 0;

          this.send({ type: "get_online_friends" });
          return;
        } catch {
          this.retry++;
          const backoff = Math.min(8000, 400 * this.retry);
          await sleep(backoff);
        }
      }
    })().finally(() => {
      this.connecting = null;
    });

    return this.connecting;
  }

  private buildWsUrl(token: string) {
    const explicit = (process.env.NEXT_PUBLIC_WS_BASE_URL || "").replace(
      /\/$/,
      "",
    );
    return `${explicit}/ws/${encodeURIComponent(token)}`;
  }

  private open(url: string) {
    return new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(url);
      this.ws = ws;

      let opened = false;
      const timeout = window.setTimeout(() => {
        try {
          ws.close();
        } catch {}
        reject(new Error("WS timeout"));
      }, 5000);

      ws.onopen = () => {
        opened = true;
        window.clearTimeout(timeout);
        resolve();
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as WsEvent;
          this.emit(data);
        } catch {}
      };

      ws.onclose = (ev) => {
        window.clearTimeout(timeout);
        this.ws = null;

        if (ev.code === 4008) {
          this.shouldReconnect = false;
          return;
        }

        if (!opened) reject(new Error("WS closed before open"));

        if (this.shouldReconnect) {
          this.connect().catch(() => {});
        }
      };

      ws.onerror = () => {};
    });
  }

  send(payload: any) {
    if (!this.isConnected) return false;
    try {
      this.ws!.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }

  sendMessage(receiver_id: number, content: string) {
    return this.send({ type: "send_message", receiver_id, content });
  }
  typing(receiver_id: number) {
    return this.send({ type: "typing", receiver_id });
  }
  stopTyping(receiver_id: number) {
    return this.send({ type: "stop_typing", receiver_id });
  }
  markRead(conversation_id: number) {
    return this.send({ type: "mark_read", conversation_id });
  }
  getOnlineFriends() {
    return this.send({ type: "get_online_friends" });
  }
}

export const spravaWs = new SpravaWebsocket();
