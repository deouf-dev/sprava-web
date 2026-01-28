"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useWebsocket } from "@/lib/ws/WebsocketContext";
import { useI18n } from "@/lib/i18n";

export default function WsToasts() {
  const { onEvent } = useWebsocket();
  const { t } = useI18n();

  useEffect(() => {
    const off = onEvent((evt) => {
      if (evt.type === "new_friend_request") {
        toast(t.toasts.newFriendRequest, {
          description: t.toasts.friendRequestDescription.replace("{username}", evt.sender_username),
        });
      }

      if (evt.type === "friend_request_accepted") {
        toast(t.toasts.requestAccepted, {
          description: t.toasts.requestAcceptedDescription.replace("{username}", evt.friend_username),
        });
      }
    });

    return off;
  }, [onEvent, t]);

  return null;
}
