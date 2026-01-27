"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { apiFetch } from "@/lib/api/apiFetch";

type MediaMeta = {
  id: number;
  filename: string;
  file_size: number;
  message_id: number;
};

function getMediaKind(filename: string): "image" | "video" | "file" {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return "file";

  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";

  return "file";
}

export default function MediaItem({ mediaId }: { mediaId: number }) {
  const { token } = useAuth();
  const [meta, setMeta] = useState<MediaMeta | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const res = (await apiFetch(`/media?media_id=${mediaId}`, {
          token,
        })) as MediaMeta;
        const data: MediaMeta = res;
        setMeta(data);
      } catch (error) {
        console.log(error);
        setError(true);
      }
    }

    fetchMeta();
  }, [mediaId, token]);

  const downloadUrl = useMemo(
    () =>
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/media/download?media_id=${mediaId}`,
    [mediaId],
  );

  if (error) {
    return <div className="text-xs text-destructive">Média indisponible</div>;
  }

  if (!meta) {
    return <div className="text-xs text-muted-foreground">Chargement…</div>;
  }

  const kind = getMediaKind(meta.filename);

  if (kind === "image") {
    return (
      <img
        src={downloadUrl}
        alt={meta.filename}
        className="max-w-[240px] rounded-lg border"
        loading="lazy"
      />
    );
  }

  if (kind === "video") {
    return (
      <video
        src={downloadUrl}
        controls
        className="max-w-[280px] rounded-lg border"
      />
    );
  }

  return (
    <a
      href={downloadUrl}
      download={meta.filename}
      className="flex items-center gap-2 rounded-lg border p-2 text-sm hover:bg-muted"
    >
      <span className="truncate max-w-[200px]">{meta.filename}</span>
      <span className="text-xs text-muted-foreground">
        {(meta.file_size / 1024).toFixed(1)} KB
      </span>
    </a>
  );
}
