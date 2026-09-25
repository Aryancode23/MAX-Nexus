"use client";

import { useState } from "react";
import { Download, Copy, Check } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function OcrStudioTool() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"eng" | "hin" | "eng+hin">("eng");

  function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    setImageUrl(URL.createObjectURL(file));
    setText("");
  }

  async function runOcr() {
    if (!imageUrl) return;
    setStatus("processing");
    setProgress(0);
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(imageUrl, language, {
        logger: (m) => {
          if (m.status && typeof m.progress === "number") {
            setProgressLabel(m.status);
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(result.data.text.trim());
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function downloadTxt() {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted-text.txt";
    a.click();
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 48;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    const lines = doc.splitTextToSize(text, pageWidth);
    doc.setFontSize(11);
    doc.text(lines, marginX, 56);
    doc.save("extracted-text.pdf");
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        Runs entirely in your browser using an open-source OCR engine (Tesseract) — no image is uploaded to a
        server. First run downloads a small language file, so it can take a moment to start. Accuracy depends on
        image clarity and works best with clear, well-lit, horizontally aligned text.
      </p>

      <label className="block max-w-xs text-sm">
        Language
        <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value="eng">English</option>
          <option value="hin">Hindi (हिन्दी)</option>
          <option value="eng+hin">English + Hindi (mixed text)</option>
        </select>
      </label>

      {!imageUrl && <FileDropZone accept="image/*" onFiles={loadFile} label="Click to upload or drag and drop an image with text" allowCamera />}

      {imageUrl && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-card border border-border bg-surface-2 p-4">
            <img src={imageUrl} alt="" className="mx-auto max-h-80 rounded-control object-contain" />
          </div>

          <div className="space-y-4">
            {status === "error" && <p className="text-sm text-danger">Something went wrong reading this image. Try a clearer photo or scan.</p>}

            {status === "processing" && (
              <div>
                <p className="text-sm text-muted">{progressLabel || "Working…"}</p>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={runOcr} disabled={status === "processing"}>{status === "processing" ? "Reading text…" : "Extract text"}</Button>
              <Button variant="secondary" onClick={() => { setImageUrl(null); setText(""); }}>Choose another</Button>
            </div>

            {text && (
              <>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={10}
                  className="focus-ring w-full rounded-card border border-border bg-surface p-3 text-sm"
                />
                <div className="flex flex-wrap gap-3">
                  <Button variant="secondary" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</Button>
                  <Button variant="secondary" onClick={downloadTxt}><Download size={14} /> Download .txt</Button>
                  <Button variant="secondary" onClick={downloadPdf}><Download size={14} /> Download PDF</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
