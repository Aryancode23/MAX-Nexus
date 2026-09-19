"use client";

import { useState } from "react";
import { Download, X, GripVertical, FileText } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function PdfMergerTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  function addFiles(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles.filter((f) => f.type === "application/pdf")]);
    setResultUrl(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function move(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function merge() {
    if (files.length < 2) return;
    setStatus("processing");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const merged = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const src = await PDFDocument.load(bytes);
        const pages = await merged.copyPages(src, src.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }

      const bytes = await merged.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <FileDropZone
        accept="application/pdf"
        multiple
        onFiles={addFiles}
        label="Click to upload or drag and drop PDF files"
        hint="Add two or more — they'll merge in this order"
      />

      {files.length > 0 && (
        <ul className="divide-y divide-border rounded-card border border-border bg-surface">
          {files.map((file, i) => (
            <li key={i} className="flex items-center gap-3 p-3">
              <GripVertical size={16} className="text-muted" />
              <FileText size={20} className="text-primary" />
              <span className="flex-1 truncate text-sm">{file.name}</span>
              <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs text-muted disabled:opacity-30">↑</button>
              <button onClick={() => move(i, 1)} disabled={i === files.length - 1} className="text-xs text-muted disabled:opacity-30">↓</button>
              <button onClick={() => removeFile(i)} className="focus-ring rounded-control p-1 text-muted hover:text-danger">
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {status === "error" && (
        <p className="text-sm text-danger">Something went wrong while merging these PDFs. Make sure each file opens normally, then try again.</p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button onClick={merge} disabled={files.length < 2 || status === "processing"}>
          {status === "processing" ? "Merging…" : `Merge ${files.length} PDFs`}
        </Button>
        {resultUrl && (
          <a href={resultUrl} download="merged.pdf">
            <Button variant="secondary"><Download size={16} /> Download merged PDF</Button>
          </a>
        )}
      </div>
    </div>
  );
}
