"use client";

import { useState } from "react";
import { Download, X, GripVertical } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

interface Item {
  file: File;
  url: string;
}

export function ImageToPdfTool() {
  const [items, setItems] = useState<Item[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  function addFiles(files: File[]) {
    const next = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setItems((prev) => [...prev, ...next]);
    setResultUrl(null);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function generatePdf() {
    if (items.length === 0) return;
    setStatus("processing");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "pt", format: "a4" });

      for (let i = 0; i < items.length; i++) {
        const img = await loadImage(items[i].url);
        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const scale = Math.min(pageW / img.width, pageH / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (pageW - w) / 2;
        const y = (pageH - h) / 2;

        if (i > 0) doc.addPage();
        doc.addImage(img, "JPEG", x, y, w, h);
      }

      const blob = doc.output("blob");
      setResultUrl(URL.createObjectURL(blob));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <FileDropZone
        accept="image/*"
        multiple
        allowCamera
        onFiles={addFiles}
        label="Click to upload or drag and drop images"
        hint="Add as many as you need — they'll appear in this order"
      />

      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <GripVertical size={16} className="text-muted" />
              <img src={item.url} alt="" className="h-12 w-12 rounded-control object-cover" />
              <span className="flex-1 truncate text-sm">{item.file.name}</span>
              <button onClick={() => removeItem(i)} className="focus-ring rounded-control p-1 text-muted hover:text-danger">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {status === "error" && (
        <p className="text-sm text-danger">Something went wrong while creating the PDF. Please try again.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={generatePdf} disabled={items.length === 0 || status === "processing"}>
          {status === "processing" ? "Generating…" : `Create PDF (${items.length} image${items.length === 1 ? "" : "s"})`}
        </Button>
        {resultUrl && (
          <a href={resultUrl} download="images.pdf">
            <Button variant="secondary">
              <Download size={16} /> Download PDF
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
