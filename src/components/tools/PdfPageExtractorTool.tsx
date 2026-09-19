"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

function parseRange(input: string, max: number): number[] {
  const pages = new Set<number>();
  for (const part of input.split(",").map((s) => s.trim()).filter(Boolean)) {
    const m = part.match(/^(\d+)-(\d+)$/);
    if (m) {
      const a = Math.max(1, +m[1]);
      const b = Math.min(max, +m[2]);
      for (let i = a; i <= b; i++) pages.add(i - 1);
    } else {
      const n = +part;
      if (n >= 1 && n <= max) pages.add(n - 1);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function PdfPageExtractorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [range, setRange] = useState("1");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  async function loadFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    const { PDFDocument } = await import("pdf-lib");
    const doc = await PDFDocument.load(await f.arrayBuffer());
    setPageCount(doc.getPageCount());
  }

  async function extract() {
    if (!file) return;
    setStatus("processing");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await file.arrayBuffer());
      const indices = parseRange(range, src.getPageCount());
      if (indices.length === 0) throw new Error("no pages");
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {!file && <FileDropZone accept="application/pdf" onFiles={loadFile} label="Click to upload or drag and drop a PDF" />}
      {file && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{file.name} — {pageCount} pages</p>
          <label className="block text-sm">
            Pages to extract (e.g. 1-3,5)
            <input value={range} onChange={(e) => setRange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
          </label>
          {status === "error" && <p className="text-sm text-danger">Something went wrong. Check your page range and try again.</p>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={extract} disabled={status === "processing"}>{status === "processing" ? "Extracting…" : "Extract pages"}</Button>
            <Button variant="secondary" onClick={() => { setFile(null); setResultUrl(null); }}>Choose another</Button>
          </div>
          {resultUrl && <a href={resultUrl} download="extracted.pdf"><Button variant="secondary"><Download size={16} /> Download PDF</Button></a>}
        </div>
      )}
    </div>
  );
}
