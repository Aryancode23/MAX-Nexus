"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function PdfSplitterTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
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

  async function split() {
    if (!file) return;
    setStatus("processing");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const JSZip = (await import("jszip")).default;
      const src = await PDFDocument.load(await file.arrayBuffer());
      const zip = new JSZip();
      for (let i = 0; i < src.getPageCount(); i++) {
        const out = await PDFDocument.create();
        const [page] = await out.copyPages(src, [i]);
        out.addPage(page);
        const bytes = await out.save();
        zip.file(`page-${i + 1}.pdf`, bytes);
      }
      const blob = await zip.generateAsync({ type: "blob" });
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
          {status === "error" && <p className="text-sm text-danger">Something went wrong while splitting this PDF.</p>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={split} disabled={status === "processing"}>{status === "processing" ? "Splitting…" : `Split into ${pageCount} PDFs`}</Button>
            <Button variant="secondary" onClick={() => { setFile(null); setResultUrl(null); }}>Choose another</Button>
          </div>
          {resultUrl && <a href={resultUrl} download="pages.zip"><Button variant="secondary"><Download size={16} /> Download ZIP</Button></a>}
        </div>
      )}
    </div>
  );
}
