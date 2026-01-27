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
import {
  User,
  Ban,
  Shield,
  IdCard,
  Globe,
  Users,
  LockKeyhole,
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

  const [tab, setTab] = useState<TabKey>("my_profile");

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
          setError("Impossible de charger ton profil.");
        }
      } catch {
        setError("Impossible de charger tes paramètres.");
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
        setError("Impossible de charger la liste des utilisateurs bloqués.");
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

      setSuccess("Modifications enregistrées.");
    } catch {
      setError("Impossible d'enregistrer les modifications.");
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
      setSuccess("Avatar mis à jour.");
    } catch {
      setError("Impossible de mettre à jour l'avatar.");
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
      setSuccess("Utilisateur débloqué.");
    } catch {
      setError("Impossible de débloquer l'utilisateur.");
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
        return "Tout le monde";
      case "friends":
        return "Amis uniquement";
      case "nobody":
        return "Personne";
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 sm:max-w-[920px]">
        <div className="flex h-[600px] overflow-hidden rounded-md">
          {/* Sidebar */}
          <div className="w-[260px] shrink-0 border-r bg-muted/30 p-3">
            <div className="px-2 py-2">
              <div className="text-sm font-semibold">Paramètres</div>
              <div className="text-xs text-muted-foreground">Sprava</div>
            </div>

            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setTab("my_profile")}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "my_profile" && "bg-muted",
                )}
              >
                <User className="h-4 w-4" />
                Mon profil
              </button>

              <button
                type="button"
                onClick={() => setTab("account")}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "account" && "bg-muted",
                )}
              >
                <IdCard className="h-4 w-4" />
                Mon compte
              </button>

              <button
                type="button"
                onClick={() => setTab("security")}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "security" && "bg-muted",
                )}
              >
                <Shield className="h-4 w-4" />
                Sécurité
              </button>

              <button
                type="button"
                onClick={() => setTab("blocked")}
                className={cn(
                  "w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition",
                  "hover:bg-muted/60",
                  tab === "blocked" && "bg-muted",
                )}
              >
                <Ban className="h-4 w-4" />
                Utilisateurs bloqués
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <DialogHeader className="space-y-1">
              <DialogTitle>
                {tab === "my_profile"
                  ? "Mon profil"
                  : tab === "account"
                    ? "Mon compte"
                    : tab === "security"
                      ? "Sécurité"
                      : "Utilisateurs bloqués"}
              </DialogTitle>
              <DialogDescription>
                {tab === "my_profile"
                  ? "Ton profil visible (bio, localisation, site) + avatar."
                  : tab === "account"
                    ? "Identité et informations de compte."
                    : tab === "security"
                      ? "Contrôle ce que tu partages avec les autres."
                      : "Gère les utilisateurs que tu as bloqués."}
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
              <div className="text-sm text-muted-foreground">Chargement…</div>
            ) : (
              <>
                {/* MON PROFIL */}
                {tab === "my_profile" && me && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 rounded-xl border p-4">
                      <AvatarFromApi
                        userId={me.user_id}
                        username={me.username ?? "Utilisateur"}
                        size={56}
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium">Avatar</div>
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
                          PNG/JPG, max 5MB.
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-4">
                      <div className="text-sm font-semibold">Informations</div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          disabled={saving}
                          placeholder="Quelques mots sur toi…"
                          className="min-h-[96px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Localisation</Label>
                          <Input
                            id="location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            disabled={saving}
                            placeholder="Ex: Paris"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="website">Site</Label>
                          <Input
                            id="website"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            disabled={saving}
                            placeholder="https://…"
                          />
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Tes paramètres de partage se trouvent dans l'onglet
                        "Sécurité".
                      </div>
                    </div>
                  </div>
                )}

                {/* MON COMPTE */}
                {tab === "account" && (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="text-sm font-semibold">Compte</div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                          id="username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="mail">Email</Label>
                        <Input
                          id="mail"
                          type="email"
                          value={mail}
                          onChange={(e) => setMail(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dob">Date de naissance</Label>
                        <Input
                          id="dob"
                          type="date"
                          value={dateOfBirth}
                          onChange={(e) => setDateOfBirth(e.target.value)}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Nouveau mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={saving}
                          placeholder="Laisse vide pour ne pas changer"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SÉCURITÉ */}
                {tab === "security" && (
                  <div className="rounded-xl border p-4 space-y-4">
                    <div className="text-sm font-semibold">
                      Partage des informations
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Choisis qui peut voir tes informations personnelles.
                    </div>

                    <div className="mt-3 space-y-4">
                      {/* Localisation */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            Localisation
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qui peut voir ta localisation
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
                                Tout le monde
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Amis uniquement
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                Personne
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Email */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            Email
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qui peut voir ton email
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
                                Tout le monde
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Amis uniquement
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                Personne
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Téléphone */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            Téléphone
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qui peut voir ton numéro
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
                                Tout le monde
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Amis uniquement
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                Personne
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Date de naissance */}
                      <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium flex items-center gap-2">
                            Date de naissance
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Qui peut voir ta date de naissance
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
                                Tout le monde
                              </div>
                            </SelectItem>
                            <SelectItem value="friends">
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                Amis uniquement
                              </div>
                            </SelectItem>
                            <SelectItem value="nobody">
                              <div className="flex items-center gap-2">
                                <LockKeyhole className="h-4 w-4" />
                                Personne
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                      <strong>💡 Astuce :</strong> "Amis uniquement" permet à
                      tes amis de voir tes informations. "Tout le monde" les
                      rend visibles publiquement.
                    </div>
                  </div>
                )}

                {/* BLOQUÉS */}
                {tab === "blocked" && (
                  <div className="space-y-3">
                    {loadingBlocked ? (
                      <div className="text-sm text-muted-foreground">
                        Chargement…
                      </div>
                    ) : blocked.length === 0 ? (
                      <div className="text-sm text-muted-foreground">
                        Aucun utilisateur bloqué.
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
                                Bloqué
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              onClick={() => unblockUser(u.id)}
                              disabled={actingBlockedId === u.id}
                            >
                              {actingBlockedId === u.id ? "…" : "Débloquer"}
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
                  Fermer
                </Button>
                <Button onClick={saveAll} disabled={saving}>
                  {saving ? "Sauvegarde…" : "Sauvegarder"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
