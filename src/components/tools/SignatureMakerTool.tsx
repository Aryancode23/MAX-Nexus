"use client";
import { useRef, useState, useEffect } from "react";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

export function SignatureMakerTool() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [thickness, setThickness] = useState(3);
  const [color, setColor] = useState("#111111");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.clientWidth * 2;
    canvas.height = canvas.clientHeight * 2;
    const ctx = canvas.getContext("2d");
    ctx?.scale(2, 2);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    last.current = pos(e);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pos(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    setHasDrawn(true);
  }
  function end() { drawing.current = false; last.current = null; }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "signature.png";
    a.click();
  }

  return (
    <div className="max-w-xl space-y-4">
      <div
        className="rounded-card border-2 border-dashed border-border"
        style={{
          backgroundImage: "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
          backgroundSize: "16px 16px",
          backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
          className="h-56 w-full touch-none rounded-card"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">Color<input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-8 rounded" /></label>
        <label className="flex items-center gap-2 text-sm">Thickness<input type="range" min={1} max={8} value={thickness} onChange={(e) => setThickness(Number(e.target.value))} /></label>
      </div>
      <div className="flex gap-3">
        <Button onClick={download} disabled={!hasDrawn}><Download size={16} /> Download PNG</Button>
        <Button variant="secondary" onClick={clear}><Trash2 size={16} /> Clear</Button>
      </div>
      <p className="text-xs text-muted">Draw with your mouse, finger, or stylus. Downloads as a transparent PNG.</p>
    </div>
  );
}
