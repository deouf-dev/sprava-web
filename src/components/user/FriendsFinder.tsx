"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, UserRoundSearch } from "lucide-react";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import { useFriendRequestsSWR } from "@/hooks/useFriendRequestsSWR";
import AvatarFromApi from "./AvatarFromApi";
import { useConversations } from "@/hooks/useConversations";
import { useFriends } from "@/hooks/useFriends";
import { useI18n } from "@/lib/i18n";

type UserByUsernameResponse = {
  status_code: number;
  user_id: number;
  username: string;
  mail: string;
  date_of_birth: string;
  avatar_id: string | null;
};

type SendFriendRequestResponse = {
  status_code: number;
  message: string;
  user_id: number;
  receiver_id: number;
};

type CreateConversationResponse = {
  status_code: number;
  conversation_id: number;
};

export function FriendsFinder({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const { token } = useAuth();
  const { t } = useI18n();

  const [tab, setTab] = useState<"friends" | "requests">("friends");
  const [query, setQuery] = useState("");
  const [remoteUser, setRemoteUser] = useState<UserByUsernameResponse | null>(
    null,
  );
  const [remoteStatus, setRemoteStatus] = useState<
    "idle" | "loading" | "not_found" | "found"
  >("idle");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const friends = useFriends();
  const convs = useConversations();
  const requests = useFriendRequestsSWR();

  useEffect(() => {
    if (!open) {
      setTab("friends");
      setQuery("");
      setRemoteUser(null);
      setRemoteStatus("idle");
      setSendingRequest(false);
      setActionMessage(null);
      return;
    }
    friends.reload();
    requests.reload?.();
  }, [open]);

  const filteredFriends = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return friends.friends;
    return friends.friends.filter((f) => f.username.toLowerCase().includes(q));
  }, [friends.friends, query]);

  const alreadyFriend = useMemo(() => {
    if (!remoteUser) return false;
    return friends.friends.some((f) => f.id === remoteUser.user_id);
  }, [friends.friends, remoteUser]);

  useEffect(() => {
    if (!open || !token) return;

    const q = query.trim();
    setActionMessage(null);

    if (tab !== "friends") {
      setRemoteUser(null);
      setRemoteStatus("idle");
      return;
    }

    if (q.length < 3) {
      setRemoteUser(null);
      setRemoteStatus("idle");
      return;
    }

    if (filteredFriends.length > 0) {
      setRemoteUser(null);
      setRemoteStatus("idle");
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setRemoteStatus("loading");
        setRemoteUser(null);

        const res = (await apiFetch(
          `/user/username?username=${encodeURIComponent(q)}`,
          { method: "GET", token },
        )) as UserByUsernameResponse;

        if (!res || (res as any).status_code !== 200) {
          setRemoteUser(null);
          setRemoteStatus("not_found");
          return;
        }

        setRemoteUser(res);
        setRemoteStatus("found");
      } catch {
        setRemoteUser(null);
        setRemoteStatus("not_found");
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query, open, token, filteredFriends.length, tab]);

  async function sendFriendRequest() {
    if (!token || !remoteUser || alreadyFriend) return;
    setSendingRequest(true);
    setActionMessage(null);
    try {
      const res = (await apiFetch("/me/send_friend_request", {
        method: "POST",
        token,
        body: { receiver_id: remoteUser.user_id },
      })) as SendFriendRequestResponse;
      setActionMessage(res.message || t.friends.requestSent);
    } catch {
      setActionMessage(t.friends.requestFailed);
    } finally {
      setSendingRequest(false);
    }
  }

  async function openConversationWith(user2Id: number) {
    if (!token) return;
    setActionMessage(null);
    try {
      const res = (await apiFetch("/create_conversation", {
        method: "POST",
        token,
        body: { user2_id: user2Id },
      })) as CreateConversationResponse;
      await convs.reload();

      onOpenChange(false);
      router.push(`/chat/${res.conversation_id}`);
    } catch {
      setActionMessage(t.friends.openConversationFailed);
    }
  }

  async function acceptRequest(senderId: number) {
    await requests.accept(senderId);
    await friends.reload();
    await convs.reload();
  }

  async function rejectRequest(senderId: number) {
    await requests.reject(senderId);
    await requests.reload?.();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t.friends.title}</DialogTitle>
          <DialogDescription>
            {t.friends.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={tab === "friends" ? "default" : "outline"}
              onClick={() => setTab("friends")}
            >
              {t.friends.friendsTab}
            </Button>

            <Button
              type="button"
              variant={tab === "requests" ? "default" : "outline"}
              onClick={() => setTab("requests")}
              className="gap-2"
            >
              {t.friends.requestsTab}
              {requests.items.length > 0 && (
                <Badge className="h-5 px-2 rounded-full">
                  {requests.items.length}
                </Badge>
              )}
            </Button>

            <div className="flex-1" />
          </div>

          {tab === "friends" && (
            <>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.friends.searchPlaceholder}
                autoFocus
              />

              {actionMessage && (
                <div className="text-sm text-muted-foreground">
                  {actionMessage}
                </div>
              )}

              <Separator />

              <div className="max-h-[340px] overflow-auto space-y-1">
                {friends.isLoading && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {t.friends.loadingFriends}
                  </div>
                )}

                {!friends.isLoading && filteredFriends.length > 0 && (
                  <>
                    {filteredFriends.map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-muted/60 transition"
                        onClick={() => openConversationWith(f.id)}
                      >
                        <AvatarFromApi
                          userId={f.id}
                          username={f.username}
                          size={36}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {f.username}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.friends.openConversation}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                )}

                {!friends.isLoading &&
                  filteredFriends.length === 0 &&
                  query.trim().length < 3 && (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      {t.friends.minChars}
                    </div>
                  )}

                {!friends.isLoading &&
                  filteredFriends.length === 0 &&
                  query.trim().length >= 3 && (
                    <div className="py-6 space-y-2">
                      {remoteStatus === "loading" && (
                        <div className="text-center text-sm text-muted-foreground">
                          {t.friends.searching}
                        </div>
                      )}

                      {remoteStatus === "not_found" && (
                        <div className="text-center text-sm text-muted-foreground">
                          {t.friends.noUserFound}
                        </div>
                      )}

                      {remoteStatus === "found" && remoteUser && (
                        <div className="flex items-center gap-3 rounded-xl border px-3 py-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={sendFriendRequest}
                            disabled={sendingRequest || alreadyFriend}
                            className="shrink-0"
                            aria-label={t.friends.sendFriendRequest}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>

                          <AvatarFromApi
                            userId={remoteUser.user_id}
                            username={remoteUser.username}
                            size={36}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">
                              {remoteUser.username}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {alreadyFriend
                                ? t.friends.alreadyFriend
                                : t.friends.sendFriendRequest}
                            </div>
                          </div>

                          <UserRoundSearch className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </>
          )}

          {tab === "requests" && (
            <>
              {requests.error && (
                <div className="text-sm text-destructive">{requests.error}</div>
              )}

              <Separator />

              <div className="max-h-[340px] overflow-auto space-y-1">
                {requests.isLoading && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {t.common.loading}
                  </div>
                )}

                {!requests.isLoading && requests.items.length === 0 && (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    {t.friends.noRequests}
                  </div>
                )}

                {requests.items.map((u) => (
                  <div
                    key={u.id}
                    className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-muted/60 transition"
                  >
                    <AvatarFromApi
                      userId={u.id}
                      username={u.username}
                      size={36}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{u.username}</div>
                      <div className="text-xs text-muted-foreground">
                        {t.friends.friendRequest}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => acceptRequest(u.id)}
                        disabled={requests.actingId === u.id}
                      >
                        {t.friends.accept}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rejectRequest(u.id)}
                        disabled={requests.actingId === u.id}
                      >
                        {t.friends.reject}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
