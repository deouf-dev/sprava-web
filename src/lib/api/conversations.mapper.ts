import { apiFetch } from "./apiFetch";
import { ConversationAPI, ConversationUI } from "./conversations.types";

function formatConversationTime(dateString: string): string {
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

function mapConversationAPIToUI(conversation: ConversationAPI): ConversationUI {
  return {
    id: conversation.id,
    name: conversation.other_username,
    otherUserId: conversation.other_user_id,
    lastMessage: conversation.last_message || "",
    lastMessageAtLabel: conversation.last_message_at
      ? formatConversationTime(conversation.last_message_at)
      : "",
    unreadCount: conversation.unread_count,
  };
}

export { mapConversationAPIToUI, formatConversationTime };
