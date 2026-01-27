"use client";

import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip } from "lucide-react";

type SendResult = { messageId: number | string } | void;

export default function MessageComposer({
  onSend,
  disabled,
}: {
  onSend: (
    content: string,
    file?: File | null,
  ) => Promise<SendResult> | SendResult;
  disabled?: boolean;
}) {
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const canSend = !!content.trim() || !!selectedFile;

  function openFilePicker() {
    if (disabled || sending) return;
    fileInputRef.current?.click();
  }

  function clearFile() {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSend() {
    const text = content.trim();
    if (!text && !selectedFile) return;

    setSending(true);
    try {
      await onSend(text, selectedFile);
      setContent("");
      clearFile();
      requestAnimationFrame(() => textAreaRef.current?.focus());
    } catch (e) {
      console.error("Failed to send message:", e);
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="p-3">
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <div className="min-w-0">
            <div className="truncate font-medium">{selectedFile.name}</div>
            <div className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFile}
            disabled={disabled || sending}
          >
            Retirer
          </Button>
        </div>
      )}

      {/* ✅ Alignement: items-center + mêmes hauteurs */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={openFilePicker}
          disabled={disabled || sending}
          className="h-11 w-11 shrink-0"
          aria-label="Ajouter un fichier"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
        />

        <Textarea
          value={content}
          ref={textAreaRef}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Écrire un message…"
          className="min-h-11 max-h-[160px] resize-none"
          disabled={disabled || sending}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />

        <Button
          onClick={handleSend}
          disabled={!canSend || disabled || sending}
          className="h-11 shrink-0"
        >
          Envoyer
        </Button>
      </div>
    </Card>
  );
}
