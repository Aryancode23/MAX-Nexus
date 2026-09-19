"use client";
import { useRef, useState } from "react";
import { Copy } from "lucide-react";
import { FileDropZone } from "./FileDropZone";

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function ColorPickerTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [current, setCurrent] = useState("#4f46e5");
  const [palette, setPalette] = useState<string[]>([]);

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setImage(img);
      requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext("2d")?.drawImage(img, 0, 0);
      });
    };
    img.src = URL.createObjectURL(file);
  }

  function pick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);
    const data = canvas.getContext("2d")?.getImageData(x, y, 1, 1).data;
    if (data) {
      const hex = "#" + [data[0], data[1], data[2]].map((v) => v.toString(16).padStart(2, "0")).join("");
      setCurrent(hex);
      setPalette((p) => [hex, ...p.filter((c) => c !== hex)].slice(0, 12));
    }
  }

  const { r, g, b } = hexToRgb(current);
  const { h, s, l } = rgbToHsl(r, g, b);

  function copy(text: string) { navigator.clipboard.writeText(text); }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <input type="color" value={current} onChange={(e) => { setCurrent(e.target.value); setPalette((p) => [e.target.value, ...p].slice(0, 12)); }} className="h-12 w-12 rounded" />
        <div className="flex-1 space-y-1 text-sm">
          <CopyRow label="HEX" value={current} onCopy={copy} />
          <CopyRow label="RGB" value={`rgb(${r}, ${g}, ${b})`} onCopy={copy} />
          <CopyRow label="HSL" value={`hsl(${h}, ${s}%, ${l}%)`} onCopy={copy} />
        </div>
      </div>

      {!image && <FileDropZone accept="image/*" onFiles={loadFile} label="Upload an image to pick colors from it (optional)" />}
      {image && <canvas ref={canvasRef} onClick={pick} className="max-h-80 w-full cursor-crosshair rounded-card border border-border object-contain" />}

      {palette.length > 0 && (
        <div>
          <p className="text-sm font-medium">Palette</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {palette.map((c, i) => (
              <button key={i} onClick={() => setCurrent(c)} className="h-10 w-10 rounded-control border border-border" style={{ backgroundColor: c }} title={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CopyRow({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-muted">{label}</span>
      <code className="flex-1 rounded-control border border-border bg-surface px-2 py-1">{value}</code>
      <button onClick={() => onCopy(value)} className="text-muted hover:text-text"><Copy size={14} /></button>
    </div>
  );
}
