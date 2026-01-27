"use client";

import useSWR from "swr";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { swrKeys } from "@/lib/swr/keys";
import { apiFetch } from "@/lib/api/apiFetch";
import {
  batchUsers,
  acceptFriendRequest,
  rejectFriendRequest,
  FriendRequest,
} from "@/lib/api/friends.api";

type FriendRequestsResponse = {
  status_code: number;
  friend_requests_ids: FriendRequest[];
};
export type FriendRequestUI = {
  id: number;
  username: string;
  avatarId: string | null;
};

export function useFriendRequestsSWR() {
  const { token } = useAuth();
  const [actingId, setActingId] = useState<number | null>(null);

  const key = token ? swrKeys.friendRequests(token) : null;

  const { data, error, isLoading, mutate } = useSWR(key, async ([url, t]) => {
    const req = (await apiFetch(url, {
      method: "GET",
      token: t,
    })) as FriendRequestsResponse;
    const ids =
      req.friend_requests_ids.map((fr: FriendRequest) => fr.sender_id) ?? [];
    if (ids.length === 0) return [] as FriendRequestUI[];

    const users = await batchUsers(t, ids);
    return (users.users ?? []).map(
      (u: { user_id: number; username: string; avatar_id: string | null }) => ({
        id: u.user_id,
        username: u.username,
        avatarId: u.avatar_id,
      }),
    ) as FriendRequestUI[];
  });

  async function accept(senderId: number) {
    if (!token) return;
    setActingId(senderId);
    try {
      await acceptFriendRequest(token, senderId);
      await mutate();
    } finally {
      setActingId(null);
    }
  }

  async function reject(senderId: number) {
    if (!token) return;
    setActingId(senderId);
    try {
      await rejectFriendRequest(token, senderId);
      await mutate();
    } finally {
      setActingId(null);
    }
  }

  return {
    items: (data ?? []) as FriendRequestUI[],
    isLoading,
    error,
    actingId,
    reload: () => mutate(),
    accept,
    reject,
  };
}
