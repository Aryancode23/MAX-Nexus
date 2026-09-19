"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const POSITIONS = ["center", "top-left", "top-right", "bottom-left", "bottom-right", "tiled"] as const;

export function ImageWatermarkTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState("SAMPLE");
  const [position, setPosition] = useState<(typeof POSITIONS)[number]>("center");
  const [opacity, setOpacity] = useState(0.4);
  const [fontSize, setFontSize] = useState(48);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { setImage(img); setResultUrl(null); };
    img.src = URL.createObjectURL(file);
  }

  function apply() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.width; canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(image, 0, 0);
    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";

    if (position === "tiled") {
      const stepX = ctx.measureText(text).width + 60;
      const stepY = fontSize + 60;
      for (let y = 0; y < canvas.height + stepY; y += stepY) {
        for (let x = 0; x < canvas.width + stepX; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(-Math.PI / 8);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }
    } else {
      const w = ctx.measureText(text).width;
      const positions: Record<string, [number, number]> = {
        center: [(canvas.width - w) / 2, canvas.height / 2],
        "top-left": [20, fontSize],
        "top-right": [canvas.width - w - 20, fontSize],
        "bottom-left": [20, canvas.height - 20],
        "bottom-right": [canvas.width - w - 20, canvas.height - 20],
      };
      const [x, y] = positions[position];
      ctx.fillText(text, x, y);
    }

    canvas.toBlob((blob) => { if (blob) setResultUrl(URL.createObjectURL(blob)); }, "image/jpeg", 0.92);
  }

  return (
    <div className="space-y-6">
      {!image && <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop a photo" />}
      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-2 p-4"><img src={resultUrl || image.src} alt="" className="mx-auto max-h-80 object-contain" /></div>
          <div className="space-y-4">
            <label className="block text-sm">Watermark text<input value={text} onChange={(e) => setText(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
            <div>
              <p className="text-sm">Position</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {POSITIONS.map((p) => (<button key={p} onClick={() => setPosition(p)} className={`rounded-full border border-border px-3 py-1.5 text-xs ${position === p ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{p}</button>))}
              </div>
            </div>
            <label className="block text-sm">Opacity ({Math.round(opacity * 100)}%)<input type="range" min={0.1} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="mt-1 w-full" /></label>
            <label className="block text-sm">Font size<input type="range" min={16} max={96} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="mt-1 w-full" /></label>
            <div className="flex gap-3">
              <Button onClick={apply}>Apply watermark</Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); }}>Choose another</Button>
            </div>
            {resultUrl && <a href={resultUrl} download="watermarked.jpg"><Button variant="secondary" className="w-full"><Download size={16} /> Download</Button></a>}
          </div>
        </div>
      )}
    </div>
  );
}
