"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, Moon, Sun, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { useI18n } from "@/lib/i18n";
import SettingsDialog from "./SettingsDialog";
import AvatarFromApi from "./AvatarFromApi";

function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const enabled = saved
      ? saved === "dark"
      : document.documentElement.classList.contains("dark");

    setIsDark(enabled);
    document.documentElement.classList.toggle("dark", enabled);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggle };
}

export function UserMenu({ username }: { username: string }) {
  const router = useRouter();
  const { logout, userId } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      <Separator />

      <div className="px-3 py-3 flex items-center gap-2">
        <AvatarFromApi
          userId={userId}
          username={username}
          size={36}
        ></AvatarFromApi>

        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{username}</div>
          <div className="text-xs text-muted-foreground">{t.common.online}</div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t.userMenu.settings}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" side="top" className="w-56">
            <DropdownMenuPrimitive.Arrow className="fill-border" />

            <DropdownMenuItem
              onClick={() => setSettingsOpen(true)}
              className="gap-2"
            >
              <Settings className="h-4 w-4" />
              {t.userMenu.settings}
            </DropdownMenuItem>

            <DropdownMenuItem onClick={toggle} className="gap-2">
              {isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {isDark ? t.userMenu.lightMode : t.userMenu.darkMode}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              {t.userMenu.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </>
  );
}
export default UserMenu;
