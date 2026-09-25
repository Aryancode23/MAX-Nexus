"use client";

import { useEffect, useState } from "react";
import { Download, CheckCircle2, XCircle, Upload } from "lucide-react";
import { Button } from "@/components/Button";
import { fetchPublishedPresets } from "@/lib/presets-actions";
import {
  validateFile, allPass, inspectImageFile, inspectPdfFile,
  type Requirement, type FileInspection, type CheckResult,
} from "@/lib/validation-engine";
import { resizeAndCompressImage, humanSize } from "@/lib/file-processing";

interface Preset {
  id: string; name: string; file_type: "photo" | "pdf";
  width_px?: number; height_px?: number; formats?: string[]; max_size_kb?: number;
  max_pages?: number; page_size?: string; orientation?: string; notes?: string;
}

function presetToRequirement(p: Preset): Requirement {
  return {
    widthPx: p.width_px, heightPx: p.height_px, formats: p.formats,
    maxSizeKB: p.max_size_kb, maxPages: p.max_pages,
    pageSize: p.page_size as any, orientation: p.orientation as any,
  };
}

export function FixMyFileTool() {
  const [mode, setMode] = useState<"photo" | "pdf">("photo");
  const [presets, setPresets] = useState<Preset[]>([]);
  const [presetId, setPresetId] = useState<string>("custom");
  const [custom, setCustom] = useState<Requirement>({});

  const [file, setFile] = useState<File | null>(null);
  const [inspection, setInspection] = useState<FileInspection | null>(null);
  const [results, setResults] = useState<CheckResult[] | null>(null);

  const [workingBlobUrl, setWorkingBlobUrl] = useState<string | null>(null);
  const [pdfPageKeep, setPdfPageKeep] = useState<boolean[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");

  useEffect(() => { fetchPublishedPresets().then((p) => setPresets(p as Preset[])); }, []);

  const modePresets = presets.filter((p) => p.file_type === mode);
  const selectedPreset = modePresets.find((p) => p.id === presetId);
  const requirement: Requirement = selectedPreset ? presetToRequirement(selectedPreset) : custom;

  function reset() {
    setFile(null); setInspection(null); setResults(null); setWorkingBlobUrl(null); setPdfPageKeep([]);
  }

  async function loadFile(f: File) {
    reset();
    setFile(f);
    setStatus("processing");
    try {
      const insp = mode === "photo" ? await inspectImageFile(f) : await inspectPdfFile(f);
      setInspection(insp);
      setResults(validateFile(insp, requirement));
      if (mode === "pdf" && insp.pageCount) {
        setPdfPageKeep(Array.from({ length: insp.pageCount }, (_, i) => (requirement.maxPages ? i < requirement.maxPages : true)));
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function fixPhoto() {
    if (!file) return;
    setStatus("processing");
    try {
      const blob = await resizeAndCompressImage(file, {
        widthPx: requirement.widthPx, heightPx: requirement.heightPx,
        maxSizeKB: requirement.maxSizeKB,
        format: requirement.formats?.includes("png") ? "png" : "jpeg",
      });
      const newInspection: FileInspection = {
        widthPx: requirement.widthPx ?? inspection?.widthPx,
        heightPx: requirement.heightPx ?? inspection?.heightPx,
        format: requirement.formats?.includes("png") ? "png" : "jpeg",
        sizeKB: blob.size / 1024,
      };
      setInspection(newInspection);
      setResults(validateFile(newInspection, requirement));
      setWorkingBlobUrl(URL.createObjectURL(blob));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function applyPageTrim() {
    if (!file) return;
    setStatus("processing");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const src = await PDFDocument.load(await (workingBlobUrl ? (await fetch(workingBlobUrl)).arrayBuffer() : file.arrayBuffer()));
      const keepIndices = pdfPageKeep.map((keep, i) => (keep ? i : -1)).filter((i) => i >= 0);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, keepIndices);
      pages.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setWorkingBlobUrl(url);
      const newInsp: FileInspection = { ...inspection!, pageCount: keepIndices.length, sizeKB: blob.size / 1024 };
      setInspection(newInsp);
      setResults(validateFile(newInsp, requirement));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function applyPdfCompression(level: "light" | "medium" | "strong") {
    if (!file) return;
    setStatus("processing");
    try {
      const scaleByLevel = { light: 2.0, medium: 1.4, strong: 1.0 };
      const qualityByLevel = { light: 0.85, medium: 0.65, strong: 0.45 };
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const { jsPDF } = await import("jspdf");

      const sourceBytes = workingBlobUrl ? await (await fetch(workingBlobUrl)).arrayBuffer() : await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: sourceBytes }).promise;
      let doc: any = null;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: scaleByLevel[level] });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", qualityByLevel[level]);
        const wPt = viewport.width / scaleByLevel[level], hPt = viewport.height / scaleByLevel[level];
        if (!doc) doc = new jsPDF({ unit: "pt", format: [wPt, hPt] });
        else doc.addPage([wPt, hPt]);
        doc.addImage(dataUrl, "JPEG", 0, 0, wPt, hPt);
      }

      const blob: Blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setWorkingBlobUrl(url);
      const newInsp: FileInspection = { ...inspection!, sizeKB: blob.size / 1024 };
      setInspection(newInsp);
      setResults(validateFile(newInsp, requirement));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function applyNormalizeToA4() {
    if (!file) return;
    setStatus("processing");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const { jsPDF } = await import("jspdf");
      const sourceBytes = workingBlobUrl ? await (await fetch(workingBlobUrl)).arrayBuffer() : await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: sourceBytes }).promise;
      const A4W = 595, A4H = 842;
      let doc: any = null;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const scale = Math.min(A4W / viewport.width, A4H / viewport.height);
        const w = viewport.width * scale, h = viewport.height * scale;
        if (!doc) doc = new jsPDF({ unit: "pt", format: "a4" });
        else doc.addPage("a4");
        doc.addImage(dataUrl, "JPEG", (A4W - w) / 2, (A4H - h) / 2, w, h);
      }

      const blob: Blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setWorkingBlobUrl(url);
      const newInsp: FileInspection = { ...inspection!, pageSize: "A4", orientation: "portrait", sizeKB: blob.size / 1024 };
      setInspection(newInsp);
      setResults(validateFile(newInsp, requirement));
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  const passed = results ? allPass(results) : false;
  const needsPageTrim = results?.some((r) => r.field === "pageCount" && !r.pass);
  const needsSizeReduction = results?.some((r) => r.field === "fileSize" && !r.pass);
  const needsA4 = results?.some((r) => (r.field === "pageSize" || r.field === "orientation") && !r.pass);

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        Deterministic, browser-side fixing — no AI involved. Tell it what the file needs to be, and it applies
        exactly the operations required: resize, crop, convert, compress, trim pages, or normalize page size.
      </p>

      <div className="flex gap-2">
        {(["photo", "pdf"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setPresetId("custom"); reset(); }} className={`rounded-full border border-border px-4 py-1.5 text-sm capitalize ${mode === m ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{m}</button>
        ))}
      </div>

      <label className="block max-w-md text-sm">
        What does this file need to meet?
        <select value={presetId} onChange={(e) => { setPresetId(e.target.value); reset(); }} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
          <option value="custom">Custom requirements</option>
          {modePresets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </label>

      {presetId === "custom" && (
        <div className="grid max-w-lg gap-3 sm:grid-cols-2">
          {mode === "photo" ? (
            <>
              <NumField label="Width (px)" value={custom.widthPx} onChange={(v) => setCustom({ ...custom, widthPx: v })} />
              <NumField label="Height (px)" value={custom.heightPx} onChange={(v) => setCustom({ ...custom, heightPx: v })} />
              <NumField label="Max size (KB)" value={custom.maxSizeKB} onChange={(v) => setCustom({ ...custom, maxSizeKB: v })} />
              <label className="block text-sm">Format
                <select onChange={(e) => setCustom({ ...custom, formats: [e.target.value] })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
                  <option value="jpeg">JPEG</option><option value="png">PNG</option>
                </select>
              </label>
            </>
          ) : (
            <>
              <NumField label="Max size (KB)" value={custom.maxSizeKB} onChange={(v) => setCustom({ ...custom, maxSizeKB: v })} />
              <NumField label="Max pages" value={custom.maxPages} onChange={(v) => setCustom({ ...custom, maxPages: v })} />
              <label className="block text-sm">Page size
                <select onChange={(e) => setCustom({ ...custom, pageSize: (e.target.value || undefined) as any })} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
                  <option value="">Any</option><option value="A4">A4</option><option value="A5">A5</option><option value="Letter">Letter</option>
                </select>
              </label>
            </>
          )}
        </div>
      )}
      {selectedPreset?.notes && <p className="text-xs text-muted">{selectedPreset.notes}</p>}

      {!file && (
        <label className="focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border bg-surface-2 p-10 text-center hover:bg-surface">
          <Upload size={24} className="text-primary" />
          <span className="text-sm font-medium text-text">Click to upload a {mode === "photo" ? "photo" : "PDF"}</span>
          <input type="file" accept={mode === "photo" ? "image/*" : "application/pdf"} className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </label>
      )}

      {file && inspection && results && (
        <div className="space-y-5">
          <div className="overflow-hidden rounded-card border border-border bg-surface">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-2 text-xs uppercase text-muted">
                <tr><th className="px-4 py-2">Check</th><th className="px-4 py-2">Current</th><th className="px-4 py-2">Required</th><th className="px-4 py-2"></th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {results.map((r) => (
                  <tr key={r.field}>
                    <td className="px-4 py-2 text-text">{r.label}</td>
                    <td className="px-4 py-2 text-muted">{r.actual}</td>
                    <td className="px-4 py-2 text-muted">{r.required}</td>
                    <td className="px-4 py-2">{r.pass ? <CheckCircle2 size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {status === "error" && <p className="text-sm text-danger">Something went wrong processing this file. Try again or choose a different file.</p>}

          {!passed && mode === "photo" && (
            <Button onClick={fixPhoto} disabled={status === "processing"}>{status === "processing" ? "Fixing…" : "Fix it"}</Button>
          )}

          {!passed && mode === "pdf" && (
            <div className="space-y-4">
              {needsPageTrim && (
                <div className="rounded-card border border-border p-4">
                  <p className="text-sm font-medium text-text">Choose which pages to keep ({pdfPageKeep.filter(Boolean).length} of {pdfPageKeep.length} selected)</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pdfPageKeep.map((keep, i) => (
                      <label key={i} className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-control border text-xs ${keep ? "border-primary bg-primary/10 text-primary" : "border-border text-muted"}`}>
                        <input type="checkbox" className="hidden" checked={keep} onChange={() => setPdfPageKeep((prev) => prev.map((k, idx) => idx === i ? !k : k))} />
                        {i + 1}
                      </label>
                    ))}
                  </div>
                  <Button size="sm" className="mt-3" onClick={applyPageTrim} disabled={status === "processing"}>Apply page selection</Button>
                </div>
              )}
              {needsSizeReduction && (
                <div className="rounded-card border border-border p-4">
                  <p className="text-sm font-medium text-text">Reduce file size</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => applyPdfCompression("light")} disabled={status === "processing"}>Light</Button>
                    <Button size="sm" variant="secondary" onClick={() => applyPdfCompression("medium")} disabled={status === "processing"}>Medium</Button>
                    <Button size="sm" variant="secondary" onClick={() => applyPdfCompression("strong")} disabled={status === "processing"}>Strong</Button>
                  </div>
                  <p className="mt-1 text-xs text-muted">Compressing rasterizes each page — text will no longer be selectable in the result.</p>
                </div>
              )}
              {needsA4 && (
                <div className="rounded-card border border-border p-4">
                  <p className="text-sm font-medium text-text">Normalize page size</p>
                  <Button size="sm" variant="secondary" className="mt-2" onClick={applyNormalizeToA4} disabled={status === "processing"}>Convert pages to A4</Button>
                </div>
              )}
            </div>
          )}

          {passed && (
            <div className="rounded-card border border-success/30 bg-success/10 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 size={16} /> Ready — every requirement is met.</p>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {workingBlobUrl && (
              <a href={workingBlobUrl} download={`fixed-${file.name}`}>
                <Button variant="secondary"><Download size={16} /> Download fixed file</Button>
              </a>
            )}
            <Button variant="secondary" onClick={reset}>Start over</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value?: number; onChange: (v: number | undefined) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input type="number" value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
