"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useWebsocket } from "@/lib/ws/WebsocketContext";

export default function WsToasts() {
  const { onEvent } = useWebsocket();

  useEffect(() => {
    const off = onEvent((evt) => {
      if (evt.type === "new_friend_request") {
        toast(`Nouvelle demande d’ami`, {
          description: `${evt.sender_username} vous demande en ami.`,
        });
      }

      if (evt.type === "friend_request_accepted") {
        toast(`Demande acceptée`, {
          description: `${evt.friend_username} vous a ajouté en ami.`,
        });
      }
    });

    return off;
  }, [onEvent]);

  return null;
}
