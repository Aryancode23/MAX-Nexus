"use client";

import { useEffect, useRef, useState } from "react";

export interface CardElement {
  id: string;
  imageUrl: string;
  x: number; // percentage of card width, top-left
  y: number; // percentage of card height, top-left
  size: number; // px, square bounding box (circle crop for photo/logo, natural for signature)
  shape: "circle" | "square" | "free";
}

/**
 * Window-level pointermove/pointerup listeners, not per-element pointer
 * capture — capture broke down when the cursor moved fast or left the
 * small element's bounds (onPointerLeave was ending the drag prematurely).
 * This is used by Employee ID Card Studio and PDF Fill & Sign's signature
 * placement — fixed once here for both.
 */
export function DraggableElement({
  element,
  cardWidth,
  cardHeight,
  onMove,
  selected,
  onSelect,
}: {
  element: CardElement;
  cardWidth: number;
  cardHeight: number;
  onMove: (x: number, y: number) => void;
  selected: boolean;
  onSelect: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  const startRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;

  function onPointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    onSelect();
    startRef.current = { startX: e.clientX, startY: e.clientY, origX: element.x, origY: element.y };
    setDragging(true);
  }

  useEffect(() => {
    if (!dragging) return;

    function onMoveEvt(e: PointerEvent) {
      const start = startRef.current;
      if (!start) return;
      const dxPct = ((e.clientX - start.startX) / cardWidth) * 100;
      const dyPct = ((e.clientY - start.startY) / cardHeight) * 100;
      let nx = start.origX + dxPct;
      let ny = start.origY + dyPct;
      nx = Math.max(0, Math.min(100 - (element.size / cardWidth) * 100, nx));
      ny = Math.max(0, Math.min(100 - (element.size / cardHeight) * 100, ny));
      onMoveRef.current(nx, ny);
    }
    function onUpEvt() {
      setDragging(false);
      startRef.current = null;
    }

    window.addEventListener("pointermove", onMoveEvt);
    window.addEventListener("pointerup", onUpEvt);
    return () => {
      window.removeEventListener("pointermove", onMoveEvt);
      window.removeEventListener("pointerup", onUpEvt);
    };
  }, [dragging, cardWidth, cardHeight, element.size]);

  return (
    <div
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        left: `${element.x}%`,
        top: `${element.y}%`,
        width: element.size,
        height: element.shape === "free" ? "auto" : element.size,
        touchAction: "none",
        cursor: "move",
      }}
      className={`select-none ${selected ? "ring-2 ring-primary ring-offset-1" : ""}`}
    >
      <img
        src={element.imageUrl}
        alt=""
        draggable={false}
        className={`h-full w-full object-cover ${element.shape === "circle" ? "rounded-full" : element.shape === "square" ? "rounded-md" : ""}`}
        style={element.shape === "free" ? { width: element.size, height: "auto" } : undefined}
      />
    </div>
  );
}
