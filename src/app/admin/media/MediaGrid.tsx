"use client";

import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { deleteMedia } from "./actions";

interface MediaItem {
  id: string;
  file_name: string;
  storage_path: string;
  public_url: string;
  file_size: number;
  created_at: string;
}

export function MediaGrid({ items }: { items: MediaItem[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function copy(id: string, url: string) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  if (items.length === 0) {
    return <div className="rounded-card border border-dashed border-border p-10 text-center text-muted">No files uploaded yet.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.id} className="overflow-hidden rounded-card border border-border bg-surface">
          <div className="flex h-28 items-center justify-center bg-surface-2">
            <img src={item.public_url} alt={item.file_name} className="max-h-full max-w-full object-contain" />
          </div>
          <div className="p-2">
            <p className="truncate text-xs font-medium text-text" title={item.file_name}>{item.file_name}</p>
            <p className="text-[10px] text-muted">{(item.file_size / 1024).toFixed(0)} KB</p>
            <div className="mt-2 flex gap-1">
              <button onClick={() => copy(item.id, item.public_url)} className="flex flex-1 items-center justify-center gap-1 rounded-control border border-border py-1 text-[10px] text-muted hover:bg-surface-2">
                {copiedId === item.id ? <Check size={11} /> : <Copy size={11} />} {copiedId === item.id ? "Copied" : "Copy URL"}
              </button>
              <form action={deleteMedia.bind(null, item.id, item.storage_path)}>
                <button
                  type="submit"
                  aria-label={`Delete ${item.file_name}`}
                  onClick={(e) => { if (!confirm(`Delete ${item.file_name}?`)) e.preventDefault(); }}
                  className="rounded-control border border-border p-1 text-muted hover:border-danger hover:text-danger"
                >
                  <Trash2 size={11} />
                </button>
              </form>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
