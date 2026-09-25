"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const FORMATS = [
  { label: "PNG", mime: "image/png", ext: "png" },
  { label: "JPG", mime: "image/jpeg", ext: "jpg" },
  { label: "WebP", mime: "image/webp", ext: "webp" },
];

export function ImageFormatConverterTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [format, setFormat] = useState(FORMATS[0]);
  const [quality, setQuality] = useState(0.9);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => { setImage(img); setResultUrl(null); };
    img.src = URL.createObjectURL(file);
  }

  function convert() {
    if (!image) return;
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (format.mime === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    ctx.drawImage(image, 0, 0);
    canvas.toBlob((blob) => { if (blob) setResultUrl(URL.createObjectURL(blob)); }, format.mime, quality);
  }

  return (
    <div className="space-y-6">
      {!image && <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop an image" />}
      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-2 p-4"><img src={image.src} alt="" className="mx-auto max-h-72 object-contain" /></div>
          <div className="space-y-4">
            <div>
              <p className="text-sm">Convert to</p>
              <div className="mt-1 flex gap-2">
                {FORMATS.map((f) => (<button key={f.label} onClick={() => setFormat(f)} className={`rounded-full border border-border px-3 py-1.5 text-sm ${format.label === f.label ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{f.label}</button>))}
              </div>
            </div>
            {format.mime !== "image/png" && (
              <label className="block text-sm">Quality ({Math.round(quality * 100)}%)<input type="range" min={0.3} max={1} step={0.05} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="mt-1 w-full" /></label>
            )}
            <div className="flex gap-3">
              <Button onClick={convert}>Convert</Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); }}>Choose another</Button>
            </div>
            {resultUrl && <a href={resultUrl} download={`converted.${format.ext}`}><Button variant="secondary" className="w-full"><Download size={16} /> Download {format.label}</Button></a>}
          </div>
        </div>
      )}
    </div>
  );
}
