import { MessageAPI, MessageUI } from "./messages.types";

function formatMessageTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString(["fr-FR"], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffDays === 1) {
    return "Hier";
  } else if (diffDays < 7) {
    return date.toLocaleDateString(["fr-FR"], { weekday: "short" });
  } else {
    return date.toLocaleDateString(["fr-FR"]);
  }
}

function mapMessageAPIToUI(
  message: MessageAPI,
  myUserId: number | null,
): MessageUI {
  return {
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    content: message.content,
    createdAtLabel: formatMessageTime(message.created_at),
    isRead: message.is_read === 1,
    mediaIds: message.media_ids,
    hasMedia: message.media_ids.length > 0,
    isMine: myUserId !== null && message.sender_id === myUserId,
  };
}

export { mapMessageAPIToUI, formatMessageTime };
