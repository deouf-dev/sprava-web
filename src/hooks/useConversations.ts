"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import type { GetConversationsResponse } from "@/lib/api/conversations.types";
import { swrKeys } from "@/lib/swr/keys";

export function useConversations() {
  const { token } = useAuth();
  const key = token ? swrKeys.conversations(token) : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    ([url, t]) =>
      apiFetch(url, {
        method: "GET",
        token: t,
      }) as Promise<GetConversationsResponse>,
    { revalidateOnFocus: true },
  );

  return {
    conversations: data?.conversations ?? [],
    isLoading,
    error,
    reload: () => mutate(),
    mutate,
  };
}
