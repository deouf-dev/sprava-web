"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import { useI18n } from "@/lib/i18n";
import {
  User,
  Ban,
  Shield,
  IdCard,
  Globe,
  Users,
  LockKeyhole,
  Menu,
} from "lucide-react";
import AvatarFromApi, { invalidateUserAvatarCache } from "./AvatarFromApi";

type MeResponse = {
  status_code: number;
  user_id: number;
  username: string | null;
  mail: string;
  date_of_birth: string;
  api_token: string;
  avatar_id: string | null;
};

type UserProfileResponse = {
  status_code: number;
  user_id: number;
  bio: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  mail: string | null;
  date_of_birth: string | null;
};

type Visibility = "nobody" | "friends" | "everyone";

type MeProfilePrivateResponse = {
  status_code: number;
  bio: string | null;
  location: string | null;
  website: string | null;
  share_location: Visibility;
  share_mail: Visibility;
  share_phone: Visibility;
  share_date_of_birth: Visibility;
};

type ChangeUsernameResponse = {
  status_code: number;
  message: string;
  user_id: number;
  new_username: string;
};
type ChangeMailResponse = {
  status_code: number;
  message: string;
  user_id: number;
  new_mail: string;
};
type ChangeDobResponse = {
  status_code: number;
  message: string;
  user_id: number;
  new_date_of_birth: string;
};
type ChangePasswordResponse = {
  status_code: number;
  message: string;
  user_id: number;
};
type ChangeAvatarResponse = {
  status_code: number;
  message: string;
  user_id: number;
  avatar_id: string;
};

type BlockedUsersResponse = {
  status_code: number;
  blocked_users_ids: number[];
};
type UserBatchResponse = {
  status_code: number;
  users: Array<{
    user_id: number;
    username: string;
    mail: string;
    date_of_birth: string;
    avatar_id: string | null;
  }>;
};
type UnblockResponse = {
  status_code: number;
  message: string;
  user_id: number;
  unblocked_user_id: number;
};

type TabKey = "my_profile" | "account" | "security" | "blocked";

export default function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const { token } = useAuth();
  const { t } = useI18n();

  const [tab, setTab] = useState<TabKey>("my_profile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loadingMe, setLoadingMe] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");

  const [username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");

  const [shareLocation, setShareLocation] = useState<Visibility>("nobody");
  const [shareMail, setShareMail] = useState<Visibility>("nobody");
  const [sharePhone, setSharePhone] = useState<Visibility>("nobody");
  const [shareDob, setShareDob] = useState<Visibility>("nobody");

  const [blocked, setBlocked] = useState<
    Array<{ id: number; username: string; avatarId: string | null }>
  >([]);
  const [loadingBlocked, setLoadingBlocked] = useState(false);
  const [actingBlockedId, setActingBlockedId] = useState<number | null>(null);

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, ""),
    [],
  );

  useEffect(() => {
    if (!open) {
      setTab("my_profile");
      setError(null);
      setSuccess(null);
      setPassword("");
      setIsSidebarOpen(false);
      return;
    }
  }, [open]);

  useEffect(() => {
    async function fetchAll() {
      if (!open || !token) return;
      setLoadingMe(true);
      setError(null);
      setSuccess(null);

      try {
        const meRes = (await apiFetch("/me", {
          method: "GET",
          token,
        })) as MeResponse;
        setMe(meRes);

        setUsername(meRes.username ?? "");
        setMail(meRes.mail ?? "");
        setDateOfBirth(meRes.date_of_birth ?? "");

        try {
          const privateProfile = (await apiFetch("/me/profile", {
            method: "GET",
            token,
          })) as MeProfilePrivateResponse;
          if (privateProfile.status_code === 200) {
            setBio(privateProfile.bio ?? "");
            setLocation(privateProfile.location ?? "");
            setWebsite(privateProfile.website ?? "");

            setShareLocation(privateProfile.share_location || "nobody");
            setShareMail(privateProfile.share_mail || "nobody");
            setSharePhone(privateProfile.share_phone || "nobody");
            setShareDob(privateProfile.share_date_of_birth || "nobody");
          } else {
            throw new Error("no /me/profile");
          }
        } catch {
          setError(t.settings.loadProfileFailed);
        }
      } catch {
        setError(t.settings.loadSettingsFailed);
      } finally {
        setLoadingMe(false);
      }
    }

    fetchAll();
  }, [open, token]);

  useEffect(() => {
    async function fetchBlocked() {
      if (!open || !token) return;
      if (tab !== "blocked") return;

      setLoadingBlocked(true);
      setError(null);
      try {
        const idsRes = (await apiFetch("/me/blocked_users", {
          method: "GET",
          token,
        })) as BlockedUsersResponse;
        const ids = idsRes.blocked_users_ids ?? [];
        if (ids.length === 0) {
          setBlocked([]);
          return;
        }

        const usersRes = (await apiFetch("/user/batch", {
          method: "POST",
          token,
          body: { user_id: ids },
        })) as UserBatchResponse;
        setBlocked(
          (usersRes.users ?? []).map((u) => ({
            id: u.user_id,
            username: u.username,
            avatarId: u.avatar_id,
          })),
        );
      } catch {
        setError(t.settings.loadBlockedFailed);
      } finally {
        setLoadingBlocked(false);
      }
    }

    fetchBlocked();
  }, [open, token, tab]);

  async function saveAll() {
    if (!token) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (username.trim() && username.trim() !== (me?.username ?? "")) {
        const r = (await apiFetch("/me/change_username", {
          method: "POST",
          token,
          body: { username: username.trim() },
        })) as ChangeUsernameResponse;
        setMe((prev) => (prev ? { ...prev, username: r.new_username } : prev));
      }

      if (mail.trim() && mail.trim() !== (me?.mail ?? "")) {
        const r = (await apiFetch("/me/change_mail", {
          method: "POST",
          token,
          body: { mail: mail.trim() },
        })) as ChangeMailResponse;
        setMe((prev) => (prev ? { ...prev, mail: r.new_mail } : prev));
      }

      if (dateOfBirth && dateOfBirth !== (me?.date_of_birth ?? "")) {
        const r = (await apiFetch("/me/change_date_of_birth", {
          method: "POST",
          token,
          body: { date_of_birth: dateOfBirth },
        })) as ChangeDobResponse;
        setMe((prev) =>
          prev ? { ...prev, date_of_birth: r.new_date_of_birth } : prev,
        );
      }

      if (password.trim().length > 0) {
        (await apiFetch("/me/change_password", {
          method: "POST",
          token,
          body: { password: password.trim() },
        })) as ChangePasswordResponse;
        setPassword("");
      }

      await apiFetch("/me/update_profile", {
        method: "POST",
        token,
        body: {
          bio: bio.trim().length ? bio : null,
          location: location.trim().length ? location : null,
          website: website.trim().length ? website : null,
          share_location: shareLocation,
          share_mail: shareMail,
          share_phone: sharePhone,
          share_date_of_birth: shareDob,
        },
      });

      setSuccess(t.settings.changesSaved);
    } catch {
      setError(t.settings.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function changeAvatar(file: File) {
    if (!token || !me) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(`${apiBase}/me/change_avatar`, {
        method: "POST",
        headers: { authorization: token },
        body: form,
      });

      if (!res.ok) throw new Error("upload failed");
      const data = (await res.json()) as ChangeAvatarResponse;

      setMe((prev) => (prev ? { ...prev, avatar_id: data.avatar_id } : prev));
      invalidateUserAvatarCache(me.user_id);
      setSuccess(t.settings.avatarUpdated);
    } catch {
      setError(t.settings.avatarUpdateFailed);
    } finally {
      setSaving(false);
    }
  }

  async function unblockUser(userId: number) {
    if (!token) return;
    setActingBlockedId(userId);
    setError(null);
    setSuccess(null);
    try {
      (await apiFetch("/me/unblock_user", {
        method: "DELETE",
        token,
        body: { friend_id: userId },
      })) as UnblockResponse;
      setBlocked((prev) => prev.filter((u) => u.id !== userId));
      setSuccess(t.settings.userUnblocked);
    } catch {
      setError(t.settings.unblockFailed);
    } finally {
      setActingBlockedId(null);
    }
  }

  function getVisibilityIcon(visibility: Visibility) {
    switch (visibility) {
      case "everyone":
        return <Globe className="h-4 w-4 text-muted-foreground" />;
      case "friends":
        return <Users className="h-4 w-4 text-muted-foreground" />;
      case "nobody":
        return <LockKeyhole className="h-4 w-4 text-muted-foreground" />;
    }
  }

  function getVisibilityLabel(visibility: Visibility) {
    switch (visibility) {
      case "everyone":
        return t.settings.everyone;
      case "friends":
        return t.settings.friendsOnly;
      case "nobody":
        return t.settings.nobody;
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[920px]">
        <div className="flex h-[600px] overflow-hidden rounded-md relative">
          {/* Backdrop pour mobile */}
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <div
            className={`
              fixed inset-y-0 left-0 z-50 w-[260px] bg-muted/30 p-3 border-r
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
              md:relative md:translate-x-0 md:z-auto md:shrink-0
            `}
          >
            <div className="px-2 py-2">
              <div className="text-sm font-semibold">{t.settings.title}</div>
              <div className="text-xs text-muted-foreground">
                {t.settings.subtitle}
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setTab("my_profile");
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "my_profile" && "bg-muted",
                )}
              >
                <User className="h-4 w-4" />
                {t.settings.myProfile}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("account");
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "account" && "bg-muted",
                )}
              >
                <IdCard className="h-4 w-4" />
                {t.settings.myAccount}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("security");
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "security" && "bg-muted",
                )}
              >
                <Shield className="h-4 w-4" />
                {t.settings.security}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTab("blocked");
                  setIsSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "blocked" && "bg-muted",
                )}
              >
                <Ban className="h-4 w-4" />
                {t.settings.blockedUsers}
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto relative">
            {/* Bouton hamburger pour mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 left-2 z-10 md:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <DialogHeader className="space-y-1 mt-12 md:mt-0">
              <DialogTitle>
                {tab === "my_profile"
                  ? t.settings.myProfile
                  : tab === "account"
                    ? t.settings.myAccount
                    : tab === "security"
                      ? t.settings.security
                      : t.settings.blockedUsers}
              </DialogTitle>
              <DialogDescription>
                {tab === "my_profile"
                  ? t.settings.profileDescription
                  : tab === "account"
                    ? t.settings.accountDescription
                    : tab === "security"
                      ? t.settings.securityDescription
                      : t.settings.blockedDescription}
              </DialogDescription>
            </DialogHeader>

            <Separator className="my-4" />

            {error && (
              <div className="mb-3 text-sm text-destructive">{error}</div>
            )}
            {success && (
              <div className="mb-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}

            {loadingMe ? (
              <div className="text-sm text-muted-foreground">
                {t.common.loading}
              </div>
            ) : (
              <>
                {/* MON PROFIL */}
                {tab === "my_profile" && me && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 rounded-xl border p-4">
                      <AvatarFromApi
                        userId={me.user_id}
                        username={me.username ?? t.common.user}
                        size={56}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {t.settings.avatar}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <Input
                            type="file"
                            accept="image/*"
                            disabled={saving}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) changeAvatar(f);
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {t.settings.avatarHint}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                      <div className="text-sm font-semibold">
                        {t.settings.information}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">{t.settings.bio}</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          disabled={saving}
                          placeholder={t.settings.bioPlaceholder}
                          className="min-h-[96px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">
                            {t.settings.location}
                          </Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={saving}
                            placeholder={t.settings.locationPlaceholder}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">{t.settings.website}</Label>
                          <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            disabled={saving}
                            placeholder={t.settings.websitePlaceholder}
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {t.settings.sharingSettingsHint}
                      </div>
                    </div>
                  </div>
                )}

                {/* MON COMPTE */}
                {tab === "account" && (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="text-sm font-semibold">
                      {t.settings.account}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">
                          {t.settings.usernameLabel}
                        </Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mail">{t.settings.emailLabel}</Label>
                        <Input
                          id="mail"
                          type="email"
                          value={mail}
                          onChange={(e) => setMail(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob">
                          {t.settings.dateOfBirthLabel}
                        </Label>
                        <Input
                          id="dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {t.settings.newPasswordLabel}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={saving}
                          placeholder={t.settings.newPasswordPlaceholder}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SÉCURITÉ */}
                {tab === "security" && (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="text-sm font-semibold">
                      {t.settings.sharingInfo}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {t.settings.sharingInfoHint}
                    </div>

                    <div className="mt-3 space-y-4">
                      {/* Localisation */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {t.settings.location}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.settings.whoCanSeeLocation}
                          </div>
                        </div>
                        <Select
                          value={shareLocation}
                          onValueChange={(v: Visibility) => setShareLocation(v)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getVisibilityIcon(shareLocation)}
                                <span>{getVisibilityLabel(shareLocation)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {t.settings.everyone}
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t.settings.friendsOnly}
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                {t.settings.nobody}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {t.settings.emailLabel}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.settings.whoCanSeeEmail}
                          </div>
                        </div>
                        <Select
                          value={shareMail}
                          onValueChange={(v: Visibility) => setShareMail(v)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getVisibilityIcon(shareMail)}
                                <span>{getVisibilityLabel(shareMail)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {t.settings.everyone}
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t.settings.friendsOnly}
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                {t.settings.nobody}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Téléphone */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {t.settings.phone}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.settings.whoCanSeePhone}
                          </div>
                        </div>
                        <Select
                          value={sharePhone}
                          onValueChange={(v: Visibility) => setSharePhone(v)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getVisibilityIcon(sharePhone)}
                                <span>{getVisibilityLabel(sharePhone)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {t.settings.everyone}
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t.settings.friendsOnly}
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                {t.settings.nobody}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date de naissance */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            {t.settings.dateOfBirthLabel}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {t.settings.whoCanSeeDob}
                          </div>
                        </div>
                        <Select
                          value={shareDob}
                          onValueChange={(v: Visibility) => setShareDob(v)}
                        >
                          <SelectTrigger className="w-[160px]">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                {getVisibilityIcon(shareDob)}
                                <span>{getVisibilityLabel(shareDob)}</span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4" />
                                {t.settings.everyone}
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {t.settings.friendsOnly}
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                {t.settings.nobody}
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      {t.settings.securityTip}
                    </div>
                  </div>
                )}

                {/* BLOQUÉS */}
                {tab === "blocked" && (
                  <div className="space-y-3">
                    {loadingBlocked ? (
                      <div className="text-sm text-muted-foreground">
                        {t.common.loading}
                      </div>
                    ) : blocked.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        {t.settings.noBlockedUsers}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {blocked.map((u) => (
                          <div
                            key={u.id}
                            className="flex items-center gap-3 rounded-xl border px-3 py-2"
                          >
                            <AvatarFromApi
                              userId={u.id}
                              username={u.username}
                              size={36}
                            />
                            <div className="min-w-0 flex-1">
                              <div className="font-medium truncate">
                                {u.username}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {t.settings.blocked}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => unblockUser(u.id)}
                              disabled={actingBlockedId === u.id}
                            >
                              {actingBlockedId === u.id
                                ? "…"
                                : t.settings.unblock}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Bouton Sauvegarder en bas */}
            {!loadingMe && tab !== "blocked" && (
              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  {t.common.close}
                </Button>
                <Button onClick={saveAll} disabled={saving}>
                  {saving ? t.common.saving : t.common.save}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
