"use client";

import MessageList from "@/components/chat/MessageList";
import { apiFetch } from "@/lib/api/apiFetch";
import { useParams } from "next/navigation";
import { useMessages } from "@/hooks/useMessages";
import MessageComposer from "@/components/chat/MessageComposer";
import { useAuth } from "@/lib/auth/AuthContext";
import UserChatProfile from "@/components/chat/UserChatProfile";
import { useConversations } from "@/hooks/useConversations";
import { useMemo } from "react";
import type { ConversationAPI } from "@/lib/api/conversations.types";
import { mapConversationAPIToUI } from "@/lib/api/conversations.mapper";

type SendMessageResponse = {
  status_code: number;
  message_id: number;
  content: string;
};

export default function ConversationPage() {
  const conversationId = Number(useParams().conversationId);
  const { token } = useAuth();
  const { messages, loading, hasMore, loadMore, reload } =
    useMessages(conversationId);

  const { conversations } = useConversations();
  const convUI = useMemo(
    () => conversations.map((c: ConversationAPI) => mapConversationAPIToUI(c)),
    [conversations],
  );
  const conv = convUI.find((c) => c.id === conversationId);
  if (!conv) return <div className="p-4">Conversation introuvable.</div>;
  apiFetch("/conversation/read", {
    method: "PUT",
    token,
    body: { conversation_id: conversationId },
  });
  async function handleSend(content: string, file?: File | null) {
    const response = (await apiFetch("/conversation/send_message", {
      method: "POST",
      token,
      body: { conversation_id: conversationId, content },
    })) as SendMessageResponse;
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      await apiFetch(`/media/upload?message_id=${response.message_id}`, {
        method: "POST",
        token,
        body: formData,
      });
    }

    reload();
  }

  async function handleDeleteMessage(messageId: number) {
    if (!token) return;
    await apiFetch("/conversation/delete_message", {
      method: "DELETE",
      token,
      body: { message_id: messageId },
    });
    reload();
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header profil */}
      {conv?.otherUserId && (
        <div className="shrink-0 border-b p-3 bg-background">
          <UserChatProfile userId={conv.otherUserId} username={conv.name} />
        </div>
      )}

      <div className="flex-1 min-h-0">
        <MessageList
          messages={messages}
          loadMore={loadMore}
          hasMore={hasMore}
          loading={loading}
          onDeleteMessage={handleDeleteMessage}
        />
      </div>

      <div className="shrink-0 border-t p-3 bg-background">
        <MessageComposer onSend={handleSend} />
      </div>
    </div>
  );
}
