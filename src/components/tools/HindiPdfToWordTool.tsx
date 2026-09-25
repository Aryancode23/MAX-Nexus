"use client";

import { useState } from "react";
import { Download, Copy, Check, FileText } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

type Status = "idle" | "loading" | "converting" | "done" | "error";

/**
 * Deliberately OCR-based rather than a Krutidev-character-remap table.
 * A remap table (ASCII byte -> Unicode Devanagari glyph) was tried first,
 * but there was no way to visually verify Devanagari output correctness
 * in this environment, and shipping silently-wrong Hindi text onto a
 * document meant for a government office or court is worse than not
 * shipping the feature. Rendering each page as an image and reading it
 * with the same Hindi OCR engine OCR Studio already uses sidesteps that
 * entirely: it works the same way whether the original PDF was typed in
 * Krutidev, typed in Unicode, or is a plain scan — because it never has
 * to guess which font produced the page, only read what's visibly there.
 */
export function HindiPdfToWordTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [progressLabel, setProgressLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [language, setLanguage] = useState<"hin" | "eng+hin">("hin");

  async function loadFile(files: File[]) {
    const f = files[0];
    if (!f) return;
    setFile(f);
    setText("");
    setStatus("loading");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
      setPageCount(pdf.numPages);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function convert() {
    if (!file) return;
    setStatus("converting");
    setText("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
      const Tesseract = (await import("tesseract.js")).default;
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;

      const pageTexts: string[] = [];
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        setProgressLabel(`Reading page ${pageNum} of ${pdf.numPages}…`);
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/png");

        const result = await Tesseract.recognize(dataUrl, language, {
          logger: (m) => {
            if (m.status && typeof m.progress === "number") {
              setProgressLabel(`Page ${pageNum} of ${pdf.numPages} — ${m.status}`);
              setProgress(Math.round(((pageNum - 1 + m.progress) / pdf.numPages) * 100));
            }
          },
        });
        pageTexts.push(result.data.text.trim());
      }

      setText(pageTexts.join("\n\n— page break —\n\n"));
      setStatus("done");
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
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}.txt`;
    a.click();
  }

  async function downloadDocx() {
    const { Document, Packer, Paragraph, TextRun, PageBreak } = await import("docx");
    const pages = text.split("\n\n— page break —\n\n");

    const children: InstanceType<typeof Paragraph>[] = [];
    pages.forEach((pageText, i) => {
      const lines = pageText.split("\n");
      lines.forEach((line) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: line, font: "Nirmala UI", size: 24 })],
          })
        );
      });
      if (i < pages.length - 1) {
        children.push(new Paragraph({ children: [new PageBreak()] }));
      }
    });

    const doc = new Document({ sections: [{ children }] });
    const blob = await Packer.toBlob(doc);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${file?.name.replace(/\.pdf$/i, "") || "document"}.docx`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        Works on typed Krutidev PDFs, typed Unicode PDFs and plain scans alike — it reads each page as an
        image rather than trying to detect which font produced the text, so it doesn't need to guess.
        Runs entirely in your browser; nothing is uploaded to a server. Accuracy depends on scan/print
        quality — always check the result against the original before relying on it for anything official.
      </p>

      {!file && (
        <FileDropZone accept="application/pdf" onFiles={loadFile} label="Click to upload or drag and drop a Hindi PDF" />
      )}

      {file && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-card border border-border bg-surface-2 p-3">
            <FileText size={18} className="shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{file.name}</p>
              {pageCount > 0 && <p className="text-xs text-muted">{pageCount} page{pageCount > 1 ? "s" : ""}</p>}
            </div>
            <button
              onClick={() => { setFile(null); setText(""); setStatus("idle"); }}
              className="text-xs text-muted hover:text-danger"
            >
              Change file
            </button>
          </div>

          <label className="block max-w-xs text-sm">
            Text on the page
            <select value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
              <option value="hin">Hindi only</option>
              <option value="eng+hin">Hindi + English (mixed)</option>
            </select>
          </label>

          {status === "error" && (
            <p className="text-sm text-danger">Couldn't read this file. Make sure it's a valid, unlocked PDF and try again.</p>
          )}

          {status === "converting" && (
            <div>
              <p className="text-sm text-muted">{progressLabel || "Working…"}</p>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-muted">First run downloads a small language file — this can take longer than later runs.</p>
            </div>
          )}

          <Button onClick={convert} disabled={status === "converting" || status === "loading"}>
            {status === "converting" ? "Reading pages…" : "Convert to editable text"}
          </Button>

          {text && (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={14}
                dir="auto"
                className="focus-ring w-full rounded-card border border-border bg-surface p-3 text-sm"
              />
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" onClick={copy}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</Button>
                <Button variant="secondary" onClick={downloadTxt}><Download size={14} /> Download .txt</Button>
                <Button onClick={downloadDocx}><Download size={14} /> Download Word (.docx)</Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
