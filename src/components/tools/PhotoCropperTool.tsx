"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const ASPECTS: { label: string; value: number | null }[] = [
  { label: "Free", value: null },
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

const PREVIEW = 340;

export function PhotoCropperTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [aspect, setAspect] = useState<number | null>(1);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const effectiveAspect = aspect ?? (image ? image.width / image.height : 1);
  const boxW = effectiveAspect >= 1 ? PREVIEW : PREVIEW * effectiveAspect;
  const boxH = effectiveAspect >= 1 ? PREVIEW / effectiveAspect : PREVIEW;

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { setImage(img); setZoom(1); setOffset({ x: 0, y: 0 }); setResultUrl(null); };
    img.src = URL.createObjectURL(file);
  }

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = boxW;
    canvas.height = boxH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, boxW, boxH);
    const coverScale = Math.max(boxW / image.width, boxH / image.height) * zoom;
    const drawW = image.width * coverScale;
    const drawH = image.height * coverScale;
    const dx = (boxW - drawW) / 2 + offset.x;
    const dy = (boxH - drawH) / 2 + offset.y;
    ctx.drawImage(image, dx, dy, drawW, drawH);
  }, [image, zoom, offset, boxW, boxH]);

  useEffect(() => { draw(); }, [draw]);

  function onDown(e: React.PointerEvent) { dragRef.current = { startX: e.clientX, startY: e.clientY, origin: offset }; }
  function onMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({ x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy });
  }
  function onUp() { dragRef.current = null; }

  function exportCrop() {
    if (!image) return;
    const outW = 1000;
    const outH = Math.round(1000 / effectiveAspect);
    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scaleFactor = outW / boxW;
    const coverScale = Math.max(boxW / image.width, boxH / image.height) * zoom;
    const drawW = image.width * coverScale * scaleFactor;
    const drawH = image.height * coverScale * scaleFactor;
    const dx = ((boxW - image.width * coverScale) / 2 + offset.x) * scaleFactor;
    const dy = ((boxH - image.height * coverScale) / 2 + offset.y) * scaleFactor;
    ctx.drawImage(image, dx, dy, drawW, drawH);
    canvas.toBlob((blob) => { if (blob) setResultUrl(URL.createObjectURL(blob)); }, "image/jpeg", 0.92);
  }

  return (
    <div className="space-y-6">
      {!image && <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop a photo" allowCamera />}
      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <canvas ref={canvasRef} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} className="cursor-move touch-none rounded-control border border-border" style={{ width: boxW, height: boxH }} />
            <p className="text-xs text-muted">Drag to reposition</p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm">Aspect ratio</p>
              <div className="mt-1 flex gap-2">
                {ASPECTS.map((a) => (
                  <button key={a.label} onClick={() => setAspect(a.value)} className={`rounded-full border border-border px-3 py-1.5 text-sm ${aspect === a.value ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{a.label}</button>
                ))}
              </div>
            </div>
            <label className="block text-sm">Zoom<input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="mt-1 w-full" /></label>
            <div className="flex gap-3">
              <Button onClick={exportCrop}>Crop</Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); }}>Choose another</Button>
            </div>
            {resultUrl && <a href={resultUrl} download="cropped.jpg"><Button variant="secondary" className="w-full"><Download size={16} /> Download</Button></a>}
          </div>
        </div>
      )}
    </div>
  );
}
