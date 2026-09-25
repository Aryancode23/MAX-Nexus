"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

// Common documented photo sizes at 300 DPI. Users pick one explicitly —
// nothing is silently assumed to be an official government requirement.
const SIZES = [
  { label: '2" x 2" (US visa/passport style)', w: 600, h: 600 },
  { label: "35mm x 45mm (common ID style)", w: 413, h: 531 },
  { label: "3.5cm x 4.5cm (common ID style)", w: 413, h: 531 },
  { label: "Square 1:1", w: 500, h: 500 },
];

const PREVIEW_BOX = 320;

export function PassportPhotoTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [size, setSize] = useState(SIZES[0]);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragState = useRef<{ startX: number; startY: number; origin: { x: number; y: number } } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const aspect = size.w / size.h;
  const boxW = aspect >= 1 ? PREVIEW_BOX : PREVIEW_BOX * aspect;
  const boxH = aspect >= 1 ? PREVIEW_BOX / aspect : PREVIEW_BOX;

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setResultUrl(null);
    };
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

  function onPointerDown(e: React.PointerEvent) {
    dragState.current = { startX: e.clientX, startY: e.clientY, origin: offset };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset({ x: dragState.current.origin.x + dx, y: dragState.current.origin.y + dy });
  }
  function onPointerUp() { dragState.current = null; }

  function exportPhoto() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = size.w;
    canvas.height = size.h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scaleFactor = size.w / boxW;
    ctx.fillStyle = "#f2f2f2";
    ctx.fillRect(0, 0, size.w, size.h);

    const coverScale = Math.max(boxW / image.width, boxH / image.height) * zoom;
    const drawW = image.width * coverScale * scaleFactor;
    const drawH = image.height * coverScale * scaleFactor;
    const dx = ((boxW - image.width * coverScale) / 2 + offset.x) * scaleFactor;
    const dy = ((boxH - image.height * coverScale) / 2 + offset.y) * scaleFactor;

    ctx.drawImage(image, dx, dy, drawW, drawH);
    canvas.toBlob((blob) => {
      if (blob) setResultUrl(URL.createObjectURL(blob));
    }, "image/jpeg", 0.92);
  }

  return (
    <div className="space-y-6">
      {!image && (
        <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop a photo" allowCamera />
      )}

      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="cursor-move touch-none rounded-control border border-border"
              style={{ width: boxW, height: boxH }}
            />
            <p className="text-xs text-muted">Drag the photo to reposition it</p>
          </div>

          <div className="space-y-4">
            <label className="block text-sm">
              Size
              <select
                value={size.label}
                onChange={(e) => setSize(SIZES.find((s) => s.label === e.target.value)!)}
                className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
              >
                {SIZES.map((s) => (
                  <option key={s.label} value={s.label}>{s.label}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              Zoom
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </label>

            <div className="flex gap-3">
              <Button onClick={exportPhoto}>Generate photo</Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); }}>
                Choose another
              </Button>
            </div>

            {resultUrl && (
              <a href={resultUrl} download="passport-photo.jpg">
                <Button variant="secondary" className="w-full">
                  <Download size={16} /> Download photo
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
