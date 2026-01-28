"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import { FriendsFinder } from "@/components/user/FriendsFinder";
import { useI18n } from "@/lib/i18n";

export default function SidebarHeader() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className="px-4 py-3 space-y-3">
      <div className="flex items-center gap-2 select-none">
        <img src="/favicon.ico" alt="Sprava" className="h-6 w-6" />
        <div className="text-lg font-semibold">Sprava</div>
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-muted/60"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
          <Users className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="font-medium">{t.friends.myFriends}</div>
      </button>

      <FriendsFinder open={open} onOpenChange={setOpen} />
    </div>
  );
}
