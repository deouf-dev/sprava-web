"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import AvatarFromApi from "@/components/user/AvatarFromApi";
import { cn } from "@/lib/utils";
import UserProfileDialog from "@/components/user/UserProfileDialog";
import { useWebsocket } from "@/lib/ws/WebsocketContext";

type UserProfileResponse = {
  status_code: number;
  user_id: number;
  bio: string | null;
  website: string | null;
  location: string | null;
  phone: string | null;
  mail: string | null;
  date_of_birth: string | null;
};

export default function UserChatProfile({
  userId,
  username,
}: {
  userId: number;
  username: string;
}) {
  const { token } = useAuth();
  const [location, setLocation] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { isUserOnline } = useWebsocket();
  const isOnline = isUserOnline(userId);

  useEffect(() => {
    let alive = true;

    async function loadProfile() {
      if (!token || !userId) return;
      try {
        const res = (await apiFetch(`/user/profile?user_id=${userId}`, {
          method: "GET",
          token,
        })) as UserProfileResponse;

        if (!alive) return;
        if (res.status_code !== 200) {
          setLocation(null);
          return;
        }

        setLocation(res.location ?? null);
      } catch {
        if (!alive) return;
        setLocation(null);
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, [token, userId]);

  return (
    <>
      <button
        type="button"
        onClick={() => setProfileOpen(true)}
        className="text-left w-full"
        aria-label={`Ouvrir le profil de ${username}`}
      >
        <Card className="px-4 py-3 hover:bg-muted/40 transition">
          <div className="flex items-center gap-3">
            <div className="relative">
              <AvatarFromApi userId={userId} username={username} size={44} />
              <span
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background",
                  isOnline ? "bg-emerald-500" : "bg-muted-foreground/40",
                )}
                aria-label={isOnline ? "En ligne" : "Hors ligne"}
                title={isOnline ? "En ligne" : "Hors ligne"}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="font-semibold truncate">{username}</div>
              <div className="text-xs text-muted-foreground truncate">
                {location ? location : "—"}
              </div>
            </div>
          </div>
        </Card>
      </button>

      <UserProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        userId={userId}
        username={username}
        isOnline={isOnline}
      />
    </>
  );
}
