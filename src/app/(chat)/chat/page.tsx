"use client";

import { useI18n } from "@/lib/i18n";

export default function ChatHomePage() {
  const { t } = useI18n();

  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center space-y-2">
        <div className="text-lg font-semibold">
          {t.chat.selectConversation}
        </div>
        <div className="text-sm text-muted-foreground">
          {t.chat.selectConversationHint}
        </div>
      </div>
    </div>
  );
}
