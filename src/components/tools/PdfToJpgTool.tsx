"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [progress, setProgress] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [singlePageUrl, setSinglePageUrl] = useState<string | null>(null);

  async function loadFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setResultUrl(null);
    setSinglePageUrl(null);
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
    setPageCount(pdf.numPages);
  }

  async function convert() {
    if (!file) return;
    setStatus("processing");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;

      if (pdf.numPages === 1) {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        setSinglePageUrl(canvas.toDataURL("image/jpeg", 0.92));
        setStatus("idle");
        return;
      }

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i} of ${pdf.numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.92));
        zip.file(`page-${i}.jpg`, blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      setResultUrl(URL.createObjectURL(blob));
      setStatus("idle");
      setProgress(null);
    } catch {
      setStatus("error");
      setProgress(null);
    }
  }

  return (
    <div className="space-y-6">
      {!file && <FileDropZone accept="application/pdf" onFiles={loadFile} label="Click to upload or drag and drop a PDF" />}
      {file && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{file.name} — {pageCount} page{pageCount === 1 ? "" : "s"}</p>
          {status === "error" && <p className="text-sm text-danger">Something went wrong while converting this PDF.</p>}
          {progress && <p className="text-sm text-muted">{progress}</p>}
          <div className="flex flex-wrap gap-3">
            <Button onClick={convert} disabled={status === "processing"}>{status === "processing" ? "Converting…" : "Convert to JPG"}</Button>
            <Button variant="secondary" onClick={() => { setFile(null); setResultUrl(null); setSinglePageUrl(null); }}>Choose another</Button>
          </div>
          {singlePageUrl && <a href={singlePageUrl} download="page-1.jpg"><Button variant="secondary"><Download size={16} /> Download JPG</Button></a>}
          {resultUrl && <a href={resultUrl} download="pages.zip"><Button variant="secondary"><Download size={16} /> Download ZIP</Button></a>}
        </div>
      )}
    </div>
  );
}
