"use client";

import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ConversationSidebar from "./ConversationSidebar";
import SidebarHeader from "@/components/user/SidebarHeader";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      router.push("/login");
    }
  }, [isAuthenticated, isReady, router]);

  return (
    <div className="h-[100dvh] w-full flex">
      <aside className="w-[300px] shrink-0 bg-background">
        <div className="h-full flex flex-col">
          <SidebarHeader />
          <Separator />

          <div className="flex-1 overflow-hidden">
            <ConversationSidebar />
          </div>
        </div>
      </aside>

      <Separator orientation="vertical" />

      <main className="flex-1 min-w-0 bg-background">{children}</main>
    </div>
  );
}
