"use client";

import useSWR from "swr";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import { batchUsers } from "@/lib/api/friends.api";
import { swrKeys } from "@/lib/swr/keys";

type MeFriendsResponse = { status_code: number; friends_ids: number[] };

export type FriendUI = {
  id: number;
  username: string;
  avatarId: string | null;
};

export function useFriends() {
  const { token } = useAuth();
  const key = token ? swrKeys.friends(token) : null;

  const { data, error, isLoading, mutate } = useSWR(key, async ([url, t]) => {
    const idsRes = (await apiFetch(url, {
      method: "GET",
      token: t,
    })) as MeFriendsResponse;
    const ids = idsRes.friends_ids ?? [];
    if (ids.length === 0) return [] as FriendUI[];

    const usersRes = await batchUsers(t, ids);
    return (usersRes.users ?? []).map(
      (u: { user_id: number; username: string; avatar_id: string | null }) => ({
        id: u.user_id,
        username: u.username,
        avatarId: u.avatar_id,
      }),
    ) as FriendUI[];
  });

  return {
    friends: (data ?? []) as FriendUI[],
    isLoading,
    error,
    reload: () => mutate(),
    mutate,
  };
}
