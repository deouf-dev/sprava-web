"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { MessageUI } from "@/lib/api/messages.types";
import MediaItem from "./MediaItem";
import { Copy, Trash2 } from "lucide-react";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import { useI18n } from "@/lib/i18n";

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {}
}

export default function MessageList({
  messages,
  loadMore,
  hasMore,
  loading,
  onDeleteMessage,
}: {
  messages: MessageUI[];
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loading: boolean;
  onDeleteMessage: (messageId: number) => Promise<void> | void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { t } = useI18n();

  const isFetchingMoreRef = useRef(false);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const el = e.currentTarget;

    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
    shouldAutoScrollRef.current = nearBottom;

    if (!hasMore || loading || isFetchingMoreRef.current) return;
    if (el.scrollTop > 80) return;

    isFetchingMoreRef.current = true;
    shouldAutoScrollRef.current = false;

    const prevHeight = el.scrollHeight;

    try {
      await loadMore();
    } finally {
      requestAnimationFrame(() => {
        const newHeight = el.scrollHeight;
        el.scrollTop = el.scrollTop + (newHeight - prevHeight);
        isFetchingMoreRef.current = false;
      });
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
      >
        <div className="min-h-full flex flex-col justify-end gap-2 p-4">
          {hasMore && (
            <div className="py-2 text-center text-xs text-muted-foreground">
              {loading ? t.common.loading : t.chat.loadMore}
            </div>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={cn("flex", m.isMine ? "justify-end" : "justify-start")}
            >
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm",
                      "select-text",
                      m.isMine
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {m.content && (
                      <div className="whitespace-pre-wrap break-words">
                        {m.content}
                      </div>
                    )}

                    {m.mediaIds && m.mediaIds.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.mediaIds.map((mediaId) => (
                          <MediaItem key={mediaId} mediaId={mediaId} />
                        ))}
                      </div>
                    )}

                    <div
                      className={cn(
                        "mt-1 text-[11px] opacity-70",
                        m.isMine
                          ? "text-primary-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {m.createdAtLabel}
                    </div>
                  </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-48">
                  <ContextMenuItem
                    onSelect={() => copyText(m.content ?? "")}
                    disabled={!m.content}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {t.chat.copy}
                  </ContextMenuItem>

                  {m.isMine && (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onSelect={() => onDeleteMessage(m.id)}
                        className="flex items-center gap-2 text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        {t.chat.delete}
                      </ContextMenuItem>
                    </>
                  )}
                </ContextMenuContent>
              </ContextMenu>
            </div>
          ))}

          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
}
