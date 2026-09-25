"use client";

import { useEffect, useRef, useState } from "react";
import type { CardElementV2 } from "./schema";
import type { DataValues } from "./renderCardCanvas";

interface Props {
  element: CardElementV2;
  pxPerMm: number;
  data: DataValues;
  imageUrl?: string;
  selected: boolean;
  onSelect: () => void;
  onChange: (patch: Partial<CardElementV2>) => void;
  onCommit: () => void;
}

const HANDLES = ["nw", "ne", "sw", "se"] as const;

/**
 * Drag/resize is implemented with window-level pointermove/pointerup
 * listeners (attached only while actively dragging/resizing), rather than
 * relying on per-element setPointerCapture. That earlier approach broke
 * down when the cursor moved faster than the small element itself, or
 * landed on a nested child node — capture went to the wrong target and
 * only part of the movement registered. Window-level listeners sidestep
 * that entirely: once a drag starts, every pointer move anywhere on the
 * page updates this element until pointerup, full stop.
 */
export function EditableElement({ element: el, pxPerMm, data, imageUrl, selected, onSelect, onChange, onCommit }: Props) {
  const [interaction, setInteraction] = useState<{ type: "drag" | "resize"; handle?: string } | null>(null);
  const startRef = useRef<{ clientX: number; clientY: number; orig: { x: number; y: number; width: number; height: number } } | null>(null);
  const [editingText, setEditingText] = useState(false);

  const onChangeRef = useRef(onChange);
  const onCommitRef = useRef(onCommit);
  onChangeRef.current = onChange;
  onCommitRef.current = onCommit;

  const xPx = el.x * pxPerMm, yPx = el.y * pxPerMm, wPx = el.width * pxPerMm, hPx = el.height * pxPerMm;

  function beginDrag(e: React.PointerEvent) {
    if (el.locked || editingText) return;
    e.stopPropagation();
    onSelect();
    startRef.current = { clientX: e.clientX, clientY: e.clientY, orig: { x: el.x, y: el.y, width: el.width, height: el.height } };
    setInteraction({ type: "drag" });
  }

  function beginResize(handle: string, e: React.PointerEvent) {
    if (el.locked) return;
    e.stopPropagation();
    e.preventDefault();
    startRef.current = { clientX: e.clientX, clientY: e.clientY, orig: { x: el.x, y: el.y, width: el.width, height: el.height } };
    setInteraction({ type: "resize", handle });
  }

  useEffect(() => {
    if (!interaction) return;

    function onMove(e: PointerEvent) {
      const start = startRef.current;
      if (!start) return;
      const dxMm = (e.clientX - start.clientX) / pxPerMm;
      const dyMm = (e.clientY - start.clientY) / pxPerMm;

      if (interaction!.type === "drag") {
        onChangeRef.current({ x: start.orig.x + dxMm, y: start.orig.y + dyMm });
      } else if (interaction!.type === "resize" && interaction!.handle) {
        const h = interaction!.handle;
        const patch: Partial<CardElementV2> = {};
        if (h.includes("e")) patch.width = Math.max(4, start.orig.width + dxMm);
        if (h.includes("s")) patch.height = Math.max(4, start.orig.height + dyMm);
        if (h.includes("w")) { patch.width = Math.max(4, start.orig.width - dxMm); patch.x = start.orig.x + dxMm; }
        if (h.includes("n")) { patch.height = Math.max(4, start.orig.height - dyMm); patch.y = start.orig.y + dyMm; }
        onChangeRef.current(patch);
      }
    }

    function onUp() {
      setInteraction(null);
      startRef.current = null;
      onCommitRef.current();
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [interaction, pxPerMm]);

  const displayText = el.dataKey ? (data[el.dataKey] || el.content || "") : (el.content || "");

  return (
    <div
      onPointerDown={beginDrag}
      onDoubleClick={(e) => { if (el.type === "text") { e.stopPropagation(); setEditingText(true); } }}
      style={{
        position: "absolute", left: xPx, top: yPx, width: wPx, height: hPx,
        transform: `rotate(${el.rotation || 0}deg)`,
        opacity: el.hidden ? 0.3 : el.opacity ?? 1,
        cursor: el.locked ? "not-allowed" : "move",
        outline: selected ? "1.5px solid #4f46e5" : "none",
        outlineOffset: 1,
        touchAction: "none",
      }}
    >
      {el.type === "text" && (
        editingText ? (
          <textarea
            autoFocus
            defaultValue={displayText}
            onBlur={(e) => { onChange({ content: e.target.value }); onCommit(); setEditingText(false); }}
            style={{
              width: "100%", height: "100%", resize: "none", border: "1px dashed #4f46e5",
              fontSize: (el.fontSize ?? 12) * (pxPerMm / 3.78), fontWeight: el.fontWeight, fontStyle: el.italic ? "italic" : "normal",
              color: el.color, textAlign: el.textAlign, fontFamily: el.fontFamily, background: "rgba(255,255,255,0.9)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%", height: "100%", overflow: "hidden",
              fontSize: (el.fontSize ?? 12) * (pxPerMm / 3.78), fontWeight: el.fontWeight, fontStyle: el.italic ? "italic" : "normal",
              color: el.color, textAlign: el.textAlign, fontFamily: el.fontFamily,
              letterSpacing: el.letterSpacing, whiteSpace: "pre-wrap", lineHeight: 1.2,
            }}
          >
            {displayText || <span style={{ opacity: 0.4 }}>Empty text</span>}
          </div>
        )
      )}

      {el.type === "shape" && (
        <div
          style={{
            width: "100%", height: "100%", background: el.fill,
            borderRadius: el.shapeType === "circle" ? "50%" : (el.radius ?? 0) * pxPerMm,
          }}
        />
      )}

      {el.type === "image" && (
        <div
          style={{
            width: "100%", height: "100%", overflow: "hidden",
            borderRadius: el.imageShape === "circle" ? "50%" : 4,
            border: el.borderWidth ? `${el.borderWidth * pxPerMm}px solid ${el.borderColor}` : undefined,
            background: "#e5e7eb", display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
          ) : (
            <span style={{ fontSize: 9, color: "#9ca3af" }}>{el.dataKey || "image"}</span>
          )}
        </div>
      )}

      {selected && !el.locked && HANDLES.map((h) => (
        <div
          key={h}
          onPointerDown={(e) => beginResize(h, e)}
          style={{
            position: "absolute", width: 10, height: 10, background: "#4f46e5", borderRadius: 2, zIndex: 10,
            top: h.includes("n") ? -5 : undefined, bottom: h.includes("s") ? -5 : undefined,
            left: h.includes("w") ? -5 : undefined, right: h.includes("e") ? -5 : undefined,
            cursor: (h === "nw" || h === "se") ? "nwse-resize" : "nesw-resize",
            touchAction: "none",
          }}
        />
      ))}
    </div>
  );
}
