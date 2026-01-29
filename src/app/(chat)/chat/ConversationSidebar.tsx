"use client";

import { useConversations } from "@/hooks/useConversations";
import { useMemo, useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ConversationAPI } from "@/lib/api/conversations.types";
import { mapConversationAPIToUI } from "@/lib/api/conversations.mapper";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import UserMenu from "@/components/user/UserMenu";
import ConversationContextMenuItem from "@/components/chat/ConversationContextMenuItem";
import { useI18n } from "@/lib/i18n";

export default function ConversationSidebar({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { username } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();

  const {
    conversations,
    isLoading: loading,
    error,
    reload,
  } = useConversations();

  const convUI = useMemo(() => {
    return conversations.map((c: ConversationAPI) => mapConversationAPIToUI(c));
  }, [conversations]);

  useEffect(() => {
    const m = pathname.match(/^\/chat\/(\d+)$/);
    if (m) setSelectedId(Number(m[1]));
  }, [pathname]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 pb-2 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 pt-2">
            {loading && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t.common.loading}
              </div>
            )}

            {!loading && error && (
              <div className="p-4 text-center text-sm text-destructive">
                {String(error)}
              </div>
            )}

            {!loading && !error && convUI.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t.chat.noConversation}
              </div>
            )}

            {!loading &&
              !error &&
              convUI.length > 0 &&
              convUI.map((c) => {
                const isSelected = c.id === selectedId;
                return (
                  <ConversationContextMenuItem
                    key={c.id}
                    conversationId={c.id}
                    otherUserId={c.otherUserId}
                    otherUsername={c.name}
                    lastMessageAtLabel={c.lastMessageAtLabel}
                    lastMessage={c.lastMessage}
                    unreadCount={c.unreadCount}
                    isSelected={isSelected}
                    onSelect={() => {
                      if (isSelected) return;
                      setSelectedId(c.id);
                      router.push(`/chat/${c.id}`);
                      onClose?.();
                    }}
                    onBlocked={() => {
                      if (isSelected) {
                        setSelectedId(null);
                        router.push("/chat");
                        reload();
                      }
                    }}
                  />
                );
              })}
          </div>
        </ScrollArea>
      </div>

      <UserMenu username={username ?? t.common.user} />
    </div>
  );
}
