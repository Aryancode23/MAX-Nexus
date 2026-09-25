"use client";

import { useRef, useState } from "react";
import { Trash2, Check } from "lucide-react";
import { Button } from "@/components/Button";

export function SignaturePad({ onCreate }: { onCreate: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) { drawing.current = true; last.current = pos(e); }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.strokeStyle = "#111"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p; setHasDrawn(true);
  }
  function end() { drawing.current = false; last.current = null; }
  function clear() {
    const canvas = canvasRef.current; const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }
  function use() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onCreate(canvas.toDataURL("image/png"));
    clear();
  }
  function onUploadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onCreate(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        width={280}
        height={90}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerLeave={end}
        className="touch-none rounded-control border border-border bg-white"
      />
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={use} disabled={!hasDrawn}><Check size={12} /> Use drawn signature</Button>
        <Button size="sm" variant="secondary" onClick={clear}><Trash2 size={12} /> Clear</Button>
        <label className="focus-ring flex cursor-pointer items-center rounded-control border border-border bg-surface-2 px-2 py-1 text-xs hover:bg-surface">
          Upload image instead
          <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}
