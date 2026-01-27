"use client";

import useSWRInfinite from "swr/infinite";
import { useMemo, useCallback } from "react";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import type {
  MessageAPI,
  GetConversationMessagesResponse,
  MessageUI,
} from "@/lib/api/messages.types";
import { mapMessageAPIToUI } from "@/lib/api/messages.mapper";

const LIMIT = 50;

export function useMessages(conversationId: number) {
  const { token, userId, isReady } = useAuth();

  const baseKey = useMemo(
    () =>
      isReady && token && conversationId
        ? (["/conversation/messages", conversationId] as const)
        : null,
    [isReady, token, conversationId],
  );

  const getKey = useCallback(
    (
      pageIndex: number,
      previousPageData: GetConversationMessagesResponse | null,
    ) => {
      if (!baseKey) return null;

      if (previousPageData && previousPageData.messages.length === 0)
        return null;

      const offset = pageIndex * LIMIT;
      return [...baseKey, LIMIT, offset] as const;
    },
    [baseKey],
  );

  const fetcher = useCallback(
    async (key: readonly [string, number, number, number]) => {
      const [, convId, limit, offset] = key;
      return apiFetch(
        `/conversation/messages?conversation_id=${convId}&limit=${limit}&offset=${offset}`,
        { method: "GET", token: token! },
      ) as Promise<GetConversationMessagesResponse>;
    },
    [token],
  );

  const { data, error, isLoading, isValidating, size, setSize, mutate } =
    useSWRInfinite<GetConversationMessagesResponse>(getKey, fetcher, {
      revalidateFirstPage: true,

      revalidateAll: false,
    });

  const messages = useMemo(() => {
    if (!data) return [] as MessageUI[];

    const pages = data.flatMap((p) => p.messages ?? []);

    const ordered: MessageAPI[] = [];
    for (const page of data) {
      const raw = page.messages ?? [];
      ordered.push(...[...raw].reverse());
    }

    return ordered.map((m) => mapMessageAPIToUI(m, userId));
  }, [data, userId]);

  const loading = isLoading || (isValidating && !data);
  const loadingMore = isValidating && size > 0;

  const lastPage = data?.[data.length - 1];
  const hasMore = lastPage ? lastPage.messages.length === LIMIT : true;

  const loadMore = useCallback(async () => {
    if (!baseKey) return;
    if (!hasMore) return;
    await setSize(size + 1);
  }, [baseKey, hasMore, setSize, size]);

  const reload = useCallback(async () => {
    if (!baseKey) return;

    await mutate();
  }, [baseKey, mutate]);

  return {
    messages,
    loading,
    loadingMore,
    error: error
      ? error instanceof Error
        ? error.message
        : "Erreur inconnue"
      : null,
    hasMore,
    loadMore,
    reload,
    mutate,
  };
}
