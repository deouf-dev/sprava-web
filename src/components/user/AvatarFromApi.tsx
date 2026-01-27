"use client";

import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiFetch } from "@/lib/api/apiFetch";

type UserResponse = { avatar_id: string | null };

const userAvatarIdCache = new Map<number, string | null>();
const userAvatarIdPending = new Map<number, Promise<string | null>>();

const avatarBlobUrlCache = new Map<string, string>();
const avatarBlobPending = new Map<string, Promise<string | null>>();

export function invalidateUserAvatarCache(userId: number) {
  userAvatarIdCache.delete(userId);
}

export function invalidateAvatarBlobCache(avatarId: string) {
  const url = avatarBlobUrlCache.get(avatarId);
  if (url) URL.revokeObjectURL(url);
  avatarBlobUrlCache.delete(avatarId);
}

export default function AvatarFromApi({
  userId,
  username,
  size = 36,
}: {
  userId: number | null;
  username: string | null;
  size?: number;
}) {
  const { token } = useAuth();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const apiBaseUrl = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""),
    [],
  );

  const initials = (username ?? "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    let alive = true;

    async function getAvatarId(uid: number) {
      const cached = userAvatarIdCache.get(uid);
      if (cached !== undefined) return cached;

      const pending = userAvatarIdPending.get(uid);
      if (pending) return pending;

      const p = (async () => {
        try {
          if (!token) return null;
          const user = (await apiFetch(`/user?user_id=${uid}`, {
            method: "GET",
            token,
          })) as UserResponse;

          const avatarId = user.avatar_id ?? null;
          userAvatarIdCache.set(uid, avatarId);
          return avatarId;
        } catch {
          userAvatarIdCache.set(uid, null);
          return null;
        } finally {
          userAvatarIdPending.delete(uid);
        }
      })();

      userAvatarIdPending.set(uid, p);
      return p;
    }

    async function getAvatarBlobUrl(aid: string) {
      const cached = avatarBlobUrlCache.get(aid);
      if (cached) return cached;

      const pending = avatarBlobPending.get(aid);
      if (pending) return pending;

      const p = (async () => {
        try {
          if (!token) return null;

          const res = await fetch(
            `${apiBaseUrl}/media/avatar?avatar_id=${encodeURIComponent(aid)}`,
            { method: "GET", headers: { authorization: token } },
          );

          if (!res.ok) return null;

          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          avatarBlobUrlCache.set(aid, url);
          return url;
        } catch {
          return null;
        } finally {
          avatarBlobPending.delete(aid);
        }
      })();

      avatarBlobPending.set(aid, p);
      return p;
    }

    async function run() {
      setBlobUrl(null);
      if (!userId || !token) return;

      const avatarId = await getAvatarId(userId);
      if (!alive) return;
      if (!avatarId) return;

      const url = await getAvatarBlobUrl(avatarId);
      if (!alive) return;

      setBlobUrl(url);
    }

    run().catch(() => {});

    return () => {
      alive = false;
    };
  }, [userId, token, apiBaseUrl]);

  return (
    <Avatar style={{ width: size, height: size }}>
      {blobUrl && <AvatarImage src={blobUrl} alt={username ?? "avatar"} />}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
