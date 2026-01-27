type MessageAPI = {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  is_read: 0 | 1;
  media_ids: number[];
};

type GetConversationMessagesResponse = {
  status_code: number;
  messages: MessageAPI[];
};

type MessageUI = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAtLabel: string;
  isRead: boolean;
  mediaIds: number[];
  isMine: boolean;
  hasMedia: boolean;
};

export type { MessageAPI, GetConversationMessagesResponse, MessageUI };
