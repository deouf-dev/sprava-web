"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AvatarFromApi from "@/components/user/AvatarFromApi";
import UserProfileDialog from "@/components/user/UserProfileDialog";
import { apiFetch } from "@/lib/api/apiFetch";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { UserRound, Ban } from "lucide-react";

function truncate(text: string, max = 30) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

export default function ConversationContextMenuItem({
  conversationId,
  otherUserId,
  otherUsername,
  lastMessageAtLabel,
  lastMessage,
  unreadCount,
  isSelected,
  onSelect,
  onBlocked,
}: {
  conversationId: number;
  otherUserId: number;
  otherUsername: string;
  lastMessageAtLabel: string;
  lastMessage: string;
  unreadCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onBlocked?: () => void;
}) {
  const router = useRouter();
  const { token } = useAuth();

  const [profileOpen, setProfileOpen] = useState(false);
  const [confirmBlockOpen, setConfirmBlockOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);

  async function blockUser() {
    if (!token) return;
    setBlocking(true);
    setBlockError(null);
    try {
      await apiFetch("/me/block_user", {
        method: "POST",
        token,
        body: { friend_id: otherUserId },
      });

      setConfirmBlockOpen(false);
      onBlocked?.();

      if (isSelected) router.push("/chat");
    } catch {
      setBlockError("Impossible de bloquer cet utilisateur.");
    } finally {
      setBlocking(false);
    }
  }
  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            onClick={onSelect}
            className={cn(
              "relative w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition",
              "hover:bg-muted/60",
              isSelected && "bg-muted",
            )}
          >
            <AvatarFromApi
              userId={otherUserId}
              username={otherUsername}
              size={40}
            />

            {/* Texte */}
            <div className="relative min-w-0 flex-1 pr-8">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium truncate">{otherUsername}</div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {lastMessageAtLabel}
                </div>
              </div>

              <div className="text-sm text-muted-foreground truncate">
                {truncate(lastMessage, 15)}
              </div>

              {/* Badge non-lus ABSOLU */}
              {unreadCount > 0 && (
                <Badge className="absolute right-0 bottom-0 h-5 px-2 rounded-full">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </div>
          </button>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          <ContextMenuItem
            onSelect={() => setProfileOpen(true)}
            className="flex items-center gap-2"
          >
            <UserRound className="h-4 w-4" />
            Afficher le profil
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            onSelect={() => setConfirmBlockOpen(true)}
            className="flex items-center gap-2 text-destructive focus:text-destructive"
          >
            <Ban className="h-4 w-4" />
            Bloquer
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Profil */}
      <UserProfileDialog
        open={profileOpen}
        onOpenChange={setProfileOpen}
        userId={otherUserId}
        username={otherUsername}
      />

      {/* Confirmation blocage */}
      <AlertDialog open={confirmBlockOpen} onOpenChange={setConfirmBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloquer {otherUsername} ?</AlertDialogTitle>
            <AlertDialogDescription>
              {otherUsername} ne pourra plus te contacter ni voir ton profil
              selon tes réglages.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {blockError && (
            <div className="text-sm text-destructive">{blockError}</div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={blocking}>Annuler</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant="destructive"
                disabled={blocking}
                onClick={blockUser}
              >
                {blocking ? "Blocage…" : "Bloquer"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
