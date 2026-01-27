type ConversationAPI = {
  id: number;
  user1_id: number;
  user2_id: number;
  created_at: string;
  other_user_id: number;
  other_username: string;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
  name: string;
};

type GetConversationsResponse = {
  status_code: number;
  conversations: ConversationAPI[];
};

type ConversationUI = {
  id: number;
  name: string;
  otherUserId: number;
  lastMessage: string;
  lastMessageAtLabel: string;
  unreadCount: number;
};

export type { ConversationAPI, GetConversationsResponse, ConversationUI };
