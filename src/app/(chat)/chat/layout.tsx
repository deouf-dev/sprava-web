"use client";

import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConversationSidebar from "./ConversationSidebar";
import SidebarHeader from "@/components/user/SidebarHeader";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      router.push("/login");
    }
  }, [isAuthenticated, isReady, router]);

  return (
    <div className="h-[100dvh] w-full flex">
      {/* Backdrop pour mobile */}
      {isSideBarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSideBarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[300px] bg-background
          transform transition-transform duration-300 ease-in-out
          ${isSideBarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:z-auto md:shrink-0
        `}
      >
        <div className="h-full flex flex-col">
          <SidebarHeader />
          <Separator />

          <div className="flex-1 overflow-hidden">
            <ConversationSidebar onClose={() => setIsSideBarOpen(false)} />
          </div>
        </div>
      </aside>

      <Separator orientation="vertical" className="hidden md:block" />

      {/* Main content */}
      <main className="flex-1 min-w-0 bg-background relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 md:hidden"
          onClick={() => setIsSideBarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {children}
      </main>
    </div>
  );
}
