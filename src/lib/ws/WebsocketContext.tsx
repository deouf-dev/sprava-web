"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { spravaWs, WsEvent } from "./websocket";
import { useAuth } from "@/lib/auth/AuthContext";
import { mutate } from "swr";

type WsContextValue = {
  connected: boolean;
  onlineFriends: Set<number>;
  send: (payload: any) => boolean;
  onEvent: (fn: (evt: WsEvent) => void) => () => void;
  isUserOnline: (userId: number) => boolean;
};

const WsContext = createContext<WsContextValue | null>(null);

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isReady } = useAuth();

  const [connected, setConnected] = useState(false);
  const [onlineFriends, setOnlineFriends] = useState<Set<number>>(new Set());

  useEffect(() => {
    spravaWs.setToken(token ?? null);

    if (!isReady) return;

    if (!isAuthenticated || !token) {
      spravaWs.disconnect();
      setConnected(false);
      setOnlineFriends(new Set());
      return;
    }

    let alive = true;

    const off = spravaWs.on((evt) => {
      if (evt.type === "online_friends") {
        setOnlineFriends(new Set(evt.friends));
        return;
      }
      if (evt.type === "friend_status_change") {
        setOnlineFriends((prev) => {
          const next = new Set(prev);
          if (evt.status === "online") next.add(evt.user_id);
          else next.delete(evt.user_id);
          return next;
        });
        return;
      }

      if (evt.type === "new_conversation") {
        mutate("/me/conversations");
        return;
      }
      if (evt.type === "conversation_deleted") {
        mutate("/me/conversations");
        return;
      }

      if (evt.type === "new_message") {
        if ("conversation_id" in evt && evt.conversation_id) {
          mutate(["/conversation/messages", evt.conversation_id]);
          mutate("/me/conversations");
        } else {
          mutate("/me/conversations");
        }
        return;
      }
      if (evt.type === "delete_message") {
        mutate("/me/conversations");
        return;
      }
      if (evt.type === "messages_read") {
        mutate("/me/conversations");
        mutate(["/conversation/messages", evt.conversation_id]);
        return;
      }

      if (evt.type === "new_friend_request") {
        mutate("/me/friend_requests");
        return;
      }
      if (evt.type === "friend_request_accepted") {
        mutate("/me/friends");
        mutate("/me/conversations");
        return;
      }
    });

    spravaWs
      .connect()
      .then(() => {
        if (!alive) return;
        setConnected(true);
      })
      .catch(() => {
        if (!alive) return;
        setConnected(false);
      });

    const poll = window.setInterval(() => {
      setConnected(spravaWs.isConnected);
    }, 1000);

    return () => {
      alive = false;
      off();
      window.clearInterval(poll);
    };
  }, [token, isAuthenticated, isReady]);

  const value = useMemo<WsContextValue>(() => {
    return {
      connected,
      onlineFriends,
      send: (payload) => spravaWs.send(payload),
      onEvent: (fn) => spravaWs.on(fn),
      isUserOnline: (userId) => onlineFriends.has(userId),
    };
  }, [connected, onlineFriends]);

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWebsocket() {
  const ctx = useContext(WsContext);
  if (!ctx)
    throw new Error("useWebsocket must be used within WebsocketProvider");
  return ctx;
}
