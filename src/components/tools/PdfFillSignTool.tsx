"use client";

import { useRef, useState } from "react";
import { Download, ChevronLeft, ChevronRight, Type, PenTool, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { DraggableElement, type CardElement } from "./idcard/DraggableElement";
import { DraggableText, type TextAnnotation } from "./pdfsign/DraggableText";
import { SignaturePad } from "./pdfsign/SignaturePad";

const TARGET_W = 480;
const PDFJS_WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

interface FormField { name: string; type: "text" | "checkbox"; value: string | boolean; }
interface SigElement extends CardElement { page: number; }

export function PdfFillSignTool() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageImageUrl, setPageImageUrl] = useState<string | null>(null);
  const [pageDims, setPageDims] = useState({ w: TARGET_W, h: TARGET_W * 1.4 });

  const [hasFormFields, setHasFormFields] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);

  const [textAnnotations, setTextAnnotations] = useState<TextAnnotation[]>([]);
  const [sigElements, setSigElements] = useState<SigElement[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedSigId, setSelectedSigId] = useState<string | null>(null);
  const [showSigPad, setShowSigPad] = useState(false);

  const [status, setStatus] = useState<"idle" | "loading" | "exporting" | "error">("idle");
  const previewRef = useRef<HTMLDivElement>(null);

  async function loadFile(f: File) {
    setStatus("loading");
    setFile(f);
    setTextAnnotations([]); setSigElements([]); setCurrentPage(0);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await f.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const fields = doc.getForm().getFields();

      if (fields.length > 0) {
        setHasFormFields(true);
        setFormFields(
          fields
            .map((field) => {
              const name = field.getName();
              const ctorName = field.constructor.name;
              if (ctorName === "PDFCheckBox") return { name, type: "checkbox" as const, value: false };
              if (ctorName === "PDFTextField") return { name, type: "text" as const, value: "" };
              return null;
            })
            .filter(Boolean) as FormField[]
        );
      } else {
        setHasFormFields(false);
        setFormFields([]);
      }
      setNumPages(doc.getPageCount());
      await renderPage(f, 0);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function renderPage(f: File, pageIndex: number) {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;
    const pdf = await pdfjsLib.getDocument({ data: await f.arrayBuffer() }).promise;
    const page = await pdf.getPage(pageIndex + 1);
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = TARGET_W / baseViewport.width;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width; canvas.height = viewport.height;
    await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
    setPageDims({ w: viewport.width, h: viewport.height });
    setPageImageUrl(canvas.toDataURL("image/jpeg", 0.9));
  }

  async function goToPage(index: number) {
    if (!file || index < 0 || index >= numPages) return;
    setCurrentPage(index);
    setSelectedTextId(null); setSelectedSigId(null);
    await renderPage(file, index);
  }

  function updateField(name: string, value: string | boolean) {
    setFormFields((prev) => prev.map((f) => (f.name === name ? { ...f, value } : f)));
  }

  function addText() {
    const id = crypto.randomUUID();
    setTextAnnotations((prev) => [...prev, { id, page: currentPage, x: 30, y: 40, text: "Text", fontSize: 16 }]);
    setSelectedTextId(id);
  }
  function addSignature(dataUrl: string) {
    const id = crypto.randomUUID();
    setSigElements((prev) => [...prev, { id, page: currentPage, imageUrl: dataUrl, x: 20, y: 60, size: 110, shape: "free" }]);
    setShowSigPad(false);
    setSelectedSigId(id);
  }

  const pageTextAnnotations = textAnnotations.filter((t) => t.page === currentPage);
  const pageSigElements = sigElements.filter((s) => s.page === currentPage);

  async function exportForm() {
    if (!file) return;
    setStatus("exporting");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const form = doc.getForm();

      for (const f of formFields) {
        try {
          if (f.type === "text") form.getTextField(f.name).setText(String(f.value || ""));
          else {
            const cb = form.getCheckBox(f.name);
            if (f.value) cb.check(); else cb.uncheck();
          }
        } catch { /* field type mismatch — skip rather than crash the whole export */ }
      }
      form.flatten();

      if (sigElements.length > 0) {
        for (const sig of sigElements) {
          const page = doc.getPage(sig.page);
          const { width, height } = page.getSize();
          const pngBytes = await (await fetch(sig.imageUrl)).arrayBuffer();
          const png = await doc.embedPng(pngBytes);
          const wPt = (sig.size / TARGET_W) * width;
          const hPt = wPt * (png.height / png.width);
          const xPt = (sig.x / 100) * width;
          const yPt = height - (sig.y / 100) * height - hPt;
          page.drawImage(png, { x: xPt, y: yPt, width: wPt, height: hPt });
        }
      }

      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      triggerDownload(blob);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function exportManual() {
    if (!file) return;
    setStatus("exporting");
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER;

      const srcBytes = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(srcBytes);
      const pdf = await pdfjsLib.getDocument({ data: srcBytes.slice(0) }).promise;
      const outDoc = await PDFDocument.create();

      for (let i = 0; i < numPages; i++) {
        const pageTexts = textAnnotations.filter((t) => t.page === i);
        const pageSigs = sigElements.filter((s) => s.page === i);

        if (pageTexts.length === 0 && pageSigs.length === 0) {
          const [copied] = await outDoc.copyPages(srcDoc, [i]);
          outDoc.addPage(copied);
          continue;
        }

        const page = await pdf.getPage(i + 1);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport }).promise;

        const scaleFactor = viewport.width / TARGET_W;
        for (const t of pageTexts) {
          ctx.fillStyle = "#111";
          ctx.font = `${t.fontSize * scaleFactor}px sans-serif`;
          ctx.fillText(t.text, (t.x / 100) * viewport.width, (t.y / 100) * viewport.height + t.fontSize * scaleFactor);
        }
        for (const s of pageSigs) {
          const img = await loadImg(s.imageUrl);
          const wPx = (s.size / TARGET_W) * viewport.width;
          const hPx = wPx * (img.height / img.width);
          ctx.drawImage(img, (s.x / 100) * viewport.width, (s.y / 100) * viewport.height, wPx, hPx);
        }

        const jpegBytes = await (await fetch(canvas.toDataURL("image/jpeg", 0.92))).arrayBuffer();
        const jpg = await outDoc.embedJpg(jpegBytes);
        const originalPage = srcDoc.getPage(i);
        const { width, height } = originalPage.getSize();
        const newPage = outDoc.addPage([width, height]);
        newPage.drawImage(jpg, { x: 0, y: 0, width, height });
      }

      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: "application/pdf" });
      triggerDownload(blob);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  function triggerDownload(blob: Blob) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${(file?.name || "document").replace(/\.pdf$/i, "")}-signed.pdf`;
    a.click();
  }

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        Entirely browser-side. If this PDF has real fillable form fields, they're detected automatically and
        filled properly (text stays crisp). Otherwise, add text and your signature anywhere by dragging — those
        pages are rebuilt as high-quality images so the result looks exactly as placed.
      </p>

      {!file && (
        <label className="focus-ring flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed border-border bg-surface-2 p-10 text-center hover:bg-surface">
          <PenTool size={24} className="text-primary" />
          <span className="text-sm font-medium text-text">Click to upload a PDF</span>
          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
        </label>
      )}

      {status === "error" && <p className="text-sm text-danger">Something went wrong with this PDF. Try another file.</p>}

      {file && pageImageUrl && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="flex items-center justify-between">
              <Button size="sm" variant="secondary" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 0}><ChevronLeft size={14} /> Prev</Button>
              <span className="text-xs text-muted">Page {currentPage + 1} of {numPages}</span>
              <Button size="sm" variant="secondary" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === numPages - 1}>Next <ChevronRight size={14} /></Button>
            </div>

            <div
              ref={previewRef}
              onPointerDown={() => { setSelectedTextId(null); setSelectedSigId(null); }}
              style={{ width: pageDims.w, height: pageDims.h, backgroundImage: `url(${pageImageUrl})`, backgroundSize: "cover", position: "relative" }}
              className="mx-auto mt-3 max-w-full rounded-control border border-border"
            >
              {!hasFormFields && pageTextAnnotations.map((t) => (
                <DraggableText
                  key={t.id}
                  annotation={t}
                  containerWidth={pageDims.w}
                  containerHeight={pageDims.h}
                  selected={selectedTextId === t.id}
                  onSelect={() => setSelectedTextId(t.id)}
                  onMove={(x, y) => setTextAnnotations((prev) => prev.map((a) => (a.id === t.id ? { ...a, x, y } : a)))}
                  onChangeText={(text) => setTextAnnotations((prev) => prev.map((a) => (a.id === t.id ? { ...a, text } : a)))}
                  onDelete={() => setTextAnnotations((prev) => prev.filter((a) => a.id !== t.id))}
                />
              ))}
              {pageSigElements.map((s) => (
                <DraggableElement
                  key={s.id}
                  element={s}
                  cardWidth={pageDims.w}
                  cardHeight={pageDims.h}
                  selected={selectedSigId === s.id}
                  onSelect={() => setSelectedSigId(s.id)}
                  onMove={(x, y) => setSigElements((prev) => prev.map((el) => (el.id === s.id ? { ...el, x, y } : el)))}
                />
              ))}
            </div>
          </div>

          <div className="space-y-5">
            {hasFormFields ? (
              <div>
                <p className="text-sm font-semibold text-text">Form fields ({formFields.length})</p>
                <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
                  {formFields.map((f) => (
                    <label key={f.name} className="block text-xs">
                      {f.name}
                      {f.type === "text" ? (
                        <input value={String(f.value)} onChange={(e) => updateField(f.name, e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-2 py-1 text-sm" />
                      ) : (
                        <input type="checkbox" checked={Boolean(f.value)} onChange={(e) => updateField(f.name, e.target.checked)} className="mt-1" />
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-semibold text-text">Add to this page</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="secondary" onClick={addText}><Type size={14} /> Add text</Button>
                  <Button size="sm" variant="secondary" onClick={() => setShowSigPad((v) => !v)}><PenTool size={14} /> Add signature</Button>
                </div>
                {showSigPad && <div className="mt-3"><SignaturePad onCreate={addSignature} /></div>}
                {(selectedTextId || selectedSigId) && (
                  <p className="mt-2 text-xs text-muted">Drag to reposition. Selected text has a delete button beside it.</p>
                )}
              </div>
            )}

            <Button
              onClick={hasFormFields ? exportForm : exportManual}
              disabled={status === "exporting"}
              className="w-full"
            >
              <Download size={16} /> {status === "exporting" ? "Preparing…" : "Download signed PDF"}
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => { setFile(null); setPageImageUrl(null); }}>
              <Trash2 size={14} /> Start over
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
