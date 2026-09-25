"use client";
import { useState } from "react";
import { Download, AlertTriangle } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;

async function fileToImageDataUrl(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const bytes = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport }).promise;
    return canvas.toDataURL("image/jpeg", 0.92);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageSize(dataUrl: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.width, h: img.height });
    img.src = dataUrl;
  });
}

export function AadhaarPrintTool() {
  const [front, setFront] = useState<string | null>(null);
  const [back, setBack] = useState<string | null>(null);
  const [copies, setCopies] = useState(2);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  async function handleFront(files: File[]) { const f = files[0]; if (f) setFront(await fileToImageDataUrl(f)); }
  async function handleBack(files: File[]) { const f = files[0]; if (f) setBack(await fileToImageDataUrl(f)); }

  async function generate() {
    if (!front) return;
    setStatus("processing");
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const marginX = (pageW - CARD_W_MM) / 2;
      let y = 15;

      const frontSize = await getImageSize(front);
      const backSize = back ? await getImageSize(back) : null;

      for (let i = 0; i < copies; i++) {
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.rect(marginX, y, CARD_W_MM, CARD_H_MM);
        const fRatio = Math.min(CARD_W_MM / frontSize.w, CARD_H_MM / frontSize.h);
        const fw = frontSize.w * fRatio, fh = frontSize.h * fRatio;
        doc.addImage(front, "JPEG", marginX + (CARD_W_MM - fw) / 2, y + (CARD_H_MM - fh) / 2, fw, fh);
        y += CARD_H_MM + 6;

        if (back && backSize) {
          doc.setLineDashPattern([1.5, 1.5], 0);
          doc.rect(marginX, y, CARD_W_MM, CARD_H_MM);
          const bRatio = Math.min(CARD_W_MM / backSize.w, CARD_H_MM / backSize.h);
          const bw = backSize.w * bRatio, bh = backSize.h * bRatio;
          doc.addImage(back, "JPEG", marginX + (CARD_W_MM - bw) / 2, y + (CARD_H_MM - bh) / 2, bw, bh);
          y += CARD_H_MM + 10;
        } else {
          y += 10;
        }
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
      <div className="flex gap-2 rounded-control border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
        <p>This only reformats an ID document you already have (e.g. your downloaded e-Aadhaar PDF or a scan) into a print-ready card layout. It doesn't generate, verify, or store any ID, and works with any card-sized ID, not only Aadhaar.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Front / main page (image or PDF)</p>
          <FileDropZone accept="image/*,application/pdf" onFiles={handleFront} label="Upload front" allowCamera />
          {front && <img src={front} alt="" className="mt-2 h-24 rounded-control border border-border object-contain" />}
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Back (optional)</p>
          <FileDropZone accept="image/*" onFiles={handleBack} label="Upload back" allowCamera />
          {back && <img src={back} alt="" className="mt-2 h-24 rounded-control border border-border object-contain" />}
        </div>
      </div>

      <label className="block max-w-xs text-sm">
        Copies per page
        <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value={1}>1</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
        </select>
      </label>

      {status === "error" && <p className="text-sm text-danger">Something went wrong preparing the layout. Try different files.</p>}

      <div className="flex flex-wrap gap-3">
        <Button onClick={generate} disabled={!front || status === "processing"}>{status === "processing" ? "Preparing…" : "Generate print layout"}</Button>
      </div>
      {resultUrl && <a href={resultUrl} download="id-print.pdf"><Button variant="secondary"><Download size={16} /> Download PDF</Button></a>}
    </div>
  );
}
