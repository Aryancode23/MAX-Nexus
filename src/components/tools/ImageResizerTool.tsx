"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function ImageResizerTool() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState("image");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setWidth(img.width);
      setHeight(img.height);
      setResultUrl(null);
    };
    img.onerror = () => setStatus("error");
    img.src = URL.createObjectURL(file);
  }

  function onWidthChange(value: number) {
    if (lockAspect && image) {
      const ratio = image.height / image.width;
      setHeight(Math.round(value * ratio));
    }
    setWidth(value);
  }

  function onHeightChange(value: number) {
    if (lockAspect && image) {
      const ratio = image.width / image.height;
      setWidth(Math.round(value * ratio));
    }
    setHeight(value);
  }

  function process() {
    if (!image) return;
    setStatus("processing");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no context");
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          setStatus("error");
          return;
        }
        setResultUrl(URL.createObjectURL(blob));
        setStatus("idle");
      }, "image/png");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {!image && (
        <FileDropZone
          accept="image/*"
          onFiles={loadFile}
          allowCamera
          label="Click to upload or drag and drop an image"
          hint="JPG, PNG or WebP"
        />
      )}

      {image && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-2 p-4">
            <img src={image.src} alt="Preview" className="mx-auto max-h-72 rounded-control object-contain" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                Width (px)
                <input
                  type="number"
                  value={width}
                  onChange={(e) => onWidthChange(Number(e.target.value))}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm">
                Height (px)
                <input
                  type="number"
                  value={height}
                  onChange={(e) => onHeightChange(Number(e.target.value))}
                  className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={lockAspect}
                onChange={(e) => setLockAspect(e.target.checked)}
              />
              Lock aspect ratio
            </label>

            {status === "error" && (
              <p className="text-sm text-danger">Something went wrong while processing this image. Try another file.</p>
            )}

            <div className="flex gap-3">
              <Button onClick={process} disabled={status === "processing"}>
                <RefreshCw size={16} className={status === "processing" ? "animate-spin" : ""} />
                Resize
              </Button>
              <Button variant="secondary" onClick={() => { setImage(null); setResultUrl(null); }}>
                Choose another image
              </Button>
            </div>

            {resultUrl && (
              <a href={resultUrl} download={`${fileName}-resized.png`}>
                <Button variant="secondary" className="w-full">
                  <Download size={16} /> Download resized image
                </Button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
