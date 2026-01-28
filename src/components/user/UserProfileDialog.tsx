"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarFromApi from "@/components/user/AvatarFromApi";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import { useI18n } from "@/lib/i18n";
import { Globe, Mail, Phone, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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

function normalizeUrl(u: string) {
  const s = u.trim();
  if (!s) return s;
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

export default function UserProfileDialog({
  open,
  onOpenChange,
  userId,
  username,
  isOnline = false,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  userId: number;
  username: string;
  isOnline?: boolean;
}) {
  const { token } = useAuth();
  const { t } = useI18n();
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<"ok" | "blocked" | "not_found" | "error">(
    "ok",
  );

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!open || !token || !userId) return;
      setLoading(true);
      setState("ok");
      setProfile(null);

      try {
        const res = (await apiFetch(`/user/profile?user_id=${userId}`, {
          method: "GET",
          token,
        })) as UserProfileResponse;

        if (!alive) return;
        if ((res as any).status_code === 404) {
          setState("not_found");
          return;
        }
        if ((res as any).status_code === 403) {
          setState("blocked");
          return;
        }

        if (res.status_code !== 200) {
          setState("error");
          return;
        }

        setProfile(res);
      } catch (e: any) {
        if (!alive) return;
        // si apiFetch throw HTTPException, on essaye de détecter
        const msg = String(e?.message ?? e);
        if (msg.includes("403")) setState("blocked");
        else if (msg.includes("404")) setState("not_found");
        else setState("error");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [open, token, userId]);

  const websiteHref = useMemo(() => {
    if (!profile?.website) return null;
    return normalizeUrl(profile.website);
  }, [profile?.website]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>{t.profile.title}</DialogTitle>
          <DialogDescription>
            {t.profile.description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-3">
          <div className="relative">
            <AvatarFromApi userId={userId} username={username} size={52} />
            <span
              className={
                "absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-background " +
                (isOnline ? "bg-emerald-500" : "bg-muted-foreground/40")
              }
              aria-label={isOnline ? t.common.online : t.common.offline}
              title={isOnline ? t.common.online : t.common.offline}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold truncate">{username}</div>

            {!loading && profile?.location && (
              <div className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground truncate">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}

            {state === "blocked" && (
              <div className="mt-1">
                <Badge variant="destructive">{t.profile.accessDenied}</Badge>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-3" />

        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {!loading && state === "blocked" && (
          <div className="rounded-xl border p-4 text-sm">
            {t.profile.blockedMessage}
          </div>
        )}

        {!loading && state === "not_found" && (
          <div className="rounded-xl border p-4 text-sm">
            {t.profile.userNotFound}
          </div>
        )}

        {!loading && state === "error" && (
          <div className="rounded-xl border p-4 text-sm">
            {t.profile.loadFailed}
          </div>
        )}

        {!loading && state === "ok" && profile && (
          <div className="space-y-4">
            {profile.bio ? (
              <div className="rounded-xl border p-4">
                <div className="text-sm font-semibold">Bio</div>
                <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                  {profile.bio}
                </div>
              </div>
            ) : null}

            {websiteHref ? (
              <div className="flex items-center justify-between rounded-xl border p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{t.settings.website}</span>
                </div>

                <a
                  className="text-sm text-primary hover:underline truncate max-w-[320px]"
                  href={websiteHref}
                  target="_blank"
                  rel="noreferrer"
                >
                  {profile.website}
                </a>
              </div>
            ) : null}

            {(profile.mail || profile.phone) && (
              <div className="rounded-xl border p-4 space-y-3">
                <div className="text-sm font-semibold">{t.settings.information}</div>

                {profile.mail && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{profile.mail}</span>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span className="truncate">{profile.phone}</span>
                  </div>
                )}
              </div>
            )}

            {!profile.bio &&
              !profile.location &&
              !profile.website &&
              !profile.mail &&
              !profile.phone && (
                <div className="rounded-xl border p-4 text-sm text-muted-foreground">
                  {t.profile.noInfo}
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
