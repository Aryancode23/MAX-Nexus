"use client";

import { Lock, Unlock, Eye, EyeOff, Copy, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import type { CardElementV2 } from "./schema";

const TYPE_LABEL: Record<string, string> = { text: "Text", image: "Image", shape: "Shape", qrcode: "QR Code" };

export function LayersPanel({
  elements,
  selectedId,
  onSelect,
  onToggleLock,
  onToggleHidden,
  onDuplicate,
  onDelete,
  onReorder,
}: {
  elements: CardElementV2[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleHidden: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (id: string, dir: 1 | -1) => void;
}) {
  const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  if (sorted.length === 0) return <p className="text-xs text-muted">No elements yet — add one from the toolbar.</p>;

  return (
    <div className="space-y-1">
      {sorted.map((el) => (
        <div
          key={el.id}
          onClick={() => onSelect(el.id)}
          className={`flex items-center justify-between rounded-control border px-2 py-1.5 text-xs ${selectedId === el.id ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <span className="truncate">{TYPE_LABEL[el.type]}{el.content ? `: ${el.content.slice(0, 14)}` : ""}</span>
          <div className="flex items-center gap-1 text-muted">
            <button onClick={(e) => { e.stopPropagation(); onReorder(el.id, 1); }}><ArrowUp size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); onReorder(el.id, -1); }}><ArrowDown size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); onToggleHidden(el.id); }}>{el.hidden ? <EyeOff size={12} /> : <Eye size={12} />}</button>
            <button onClick={(e) => { e.stopPropagation(); onToggleLock(el.id); }}>{el.locked ? <Lock size={12} /> : <Unlock size={12} />}</button>
            <button onClick={(e) => { e.stopPropagation(); onDuplicate(el.id); }}><Copy size={12} /></button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(el.id); }} className="hover:text-danger"><Trash2 size={12} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
