"use client";

import { useRef } from "react";
import { X } from "lucide-react";

export interface TextAnnotation {
  id: string;
  page: number;
  x: number; // percentage
  y: number; // percentage
  text: string;
  fontSize: number;
}

export function DraggableText({
  annotation,
  containerWidth,
  containerHeight,
  selected,
  onSelect,
  onMove,
  onChangeText,
  onDelete,
}: {
  annotation: TextAnnotation;
  containerWidth: number;
  containerHeight: number;
  selected: boolean;
  onSelect: () => void;
  onMove: (x: number, y: number) => void;
  onChangeText: (text: string) => void;
  onDelete: () => void;
}) {
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    e.stopPropagation();
    onSelect();
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: annotation.x, origY: annotation.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dxPct = ((e.clientX - dragRef.current.startX) / containerWidth) * 100;
    const dyPct = ((e.clientY - dragRef.current.startY) / containerHeight) * 100;
    onMove(
      Math.max(0, Math.min(95, dragRef.current.origX + dxPct)),
      Math.max(0, Math.min(95, dragRef.current.origY + dyPct))
    );
  }
  function onPointerUp() { dragRef.current = null; }

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      style={{ position: "absolute", left: `${annotation.x}%`, top: `${annotation.y}%`, touchAction: "none" }}
      className={`flex cursor-move items-center gap-1 ${selected ? "z-10" : ""}`}
    >
      <input
        value={annotation.text}
        onChange={(e) => onChangeText(e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        style={{ fontSize: annotation.fontSize }}
        className={`rounded border bg-white/90 px-1 text-black ${selected ? "border-primary" : "border-transparent"}`}
      />
      {selected && (
        <button onClick={onDelete} className="rounded-full bg-danger p-0.5 text-white"><X size={10} /></button>
      )}
    </div>
  );
}
