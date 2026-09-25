"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Download, Pipette } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function BackgroundRemoverTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [pickedColor, setPickedColor] = useState<[number, number, number] | null>(null);
  const [tolerance, setTolerance] = useState(40);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setPickedColor(null);
      setResultUrl(null);
    };
    img.src = URL.createObjectURL(file);
  }

  const drawBase = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    ctx?.drawImage(image, 0, 0);
  }, [image]);

  useEffect(() => { drawBase(); }, [drawBase]);

  function pickColorAt(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const ctx = canvas.getContext("2d");
    const data = ctx?.getImageData(x, y, 1, 1).data;
    if (data) setPickedColor([data[0], data[1], data[2]]);
  }

  function applyRemoval() {
    if (!image || !pickedColor) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const [pr, pg, pb] = pickedColor;
    const t = tolerance;

    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const distance = Math.sqrt((r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2);
      if (distance < t) {
        imgData.data[i + 3] = 0;
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Redraw the visible preview with removal applied too.
    drawBase();
    const previewCtx = canvasRef.current?.getContext("2d");
    previewCtx?.putImageData(imgData, 0, 0);

    canvas.toBlob((blob) => {
      if (blob) setResultUrl(URL.createObjectURL(blob));
    }, "image/png");
  }

  return (
    <div className="space-y-6">
      {!image && (
        <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop a photo" allowCamera />
      )}

      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div
              className="rounded-card border border-border p-2"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundSize: "16px 16px",
                backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px",
              }}
            >
              <canvas
                ref={canvasRef}
                onClick={pickColorAt}
                className="mx-auto max-h-80 w-full cursor-crosshair object-contain"
              />
            </div>
            <p className="mt-2 flex items-center gap-1 text-xs text-muted">
              <Pipette size={12} /> Click a spot on the background to pick its color
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted">
              Best for photos with a plain, evenly lit, single-color background (like a passport photo backdrop).
              This won't cleanly cut out a busy or shadowed background.
            </p>

            {pickedColor && (
              <div className="flex items-center gap-2 text-sm">
                <span
                  className="h-6 w-6 rounded-control border border-border"
                  style={{ backgroundColor: `rgb(${pickedColor.join(",")})` }}
                />
                Picked background color
              </div>
            )}

            <label className="block text-sm">
              Tolerance ({tolerance})
              <input
                type="range"
                min={5}
                max={120}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="mt-1 w-full"
              />
              <span className="text-xs text-muted">Higher removes more shades of the picked color</span>
            </label>

            <div className="flex gap-3">
              <Button onClick={applyRemoval} disabled={!pickedColor}>Remove background</Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); setPickedColor(null); }}>
                Choose another
              </Button>
            </div>

            {resultUrl && (
              <a href={resultUrl} download="background-removed.png">
                <Button variant="secondary" className="w-full">
                  <Download size={16} /> Download transparent PNG
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
