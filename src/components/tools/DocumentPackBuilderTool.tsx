"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Download, Upload, X, ArrowUp, ArrowDown, FileText, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { fetchPublishedDocumentPacks } from "@/lib/document-packs-actions";
import { resizeAndCompressImage, imageFileToPdfBytes, humanSize } from "@/lib/file-processing";
import { saveDocumentPackProgress, getDocumentPackProgress, clearDocumentPackProgress, type SlotProgress } from "@/lib/document-pack-progress";
import { useAuth } from "@/components/AuthProvider";

interface PackTemplate {
  id: string; name: string; slug: string; description: string;
  required_documents: string[]; optional_documents: string[];
  recommended_formats?: string; recommended_max_size?: string;
  processing_notes?: string; disclaimer?: string;
}

interface Slot {
  id: string;
  label: string;
  required: boolean;
  file: File | null;
  fileName: string;
  status?: "idle" | "processing";
  restoredNote?: string;
}

export function DocumentPackBuilderTool() {
  const { user } = useAuth();
  const [packs, setPacks] = useState<PackTemplate[]>([]);
  const [selected, setSelected] = useState<PackTemplate | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [building, setBuilding] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoredBanner, setRestoredBanner] = useState(false);

  useEffect(() => { fetchPublishedDocumentPacks().then((p) => setPacks(p as PackTemplate[])); }, []);

  const searchParams = useSearchParams();
  useEffect(() => {
    const wanted = searchParams.get("template");
    if (wanted && packs.length > 0 && !selected) {
      const match = packs.find((p) => p.slug === wanted);
      if (match) choosePack(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [packs, searchParams]);

  async function choosePack(pack: PackTemplate) {
    setSelected(pack);
    setMergedUrl(null); setZipUrl(null); setError(null); setRestoredBanner(false);
    const req = pack.required_documents.map((label, i) => ({ id: `r-${i}`, label, required: true, file: null, fileName: "" }));
    const opt = pack.optional_documents.map((label, i) => ({ id: `o-${i}`, label, required: false, file: null, fileName: "" }));
    let initialSlots: Slot[] = [...req, ...opt];

    if (user) {
      const saved = await getDocumentPackProgress(pack.slug);
      if (saved && saved.length > 0) {
        initialSlots = initialSlots.map((s) => {
          const match = saved.find((sv) => sv.id === s.id);
          return match?.fileName ? { ...s, restoredNote: `Previously added: ${match.fileName} — please re-upload` } : s;
        });
        setRestoredBanner(true);
      }
    }
    setSlots(initialSlots);
  }

  // Auto-save progress metadata (not file bytes) for logged-in users, debounced.
  useEffect(() => {
    if (!user || !selected) return;
    const t = setTimeout(() => {
      const progress: SlotProgress[] = slots.map((s) => ({ id: s.id, label: s.label, required: s.required, fileName: s.fileName }));
      saveDocumentPackProgress(selected.slug, progress);
    }, 1000);
    return () => clearTimeout(t);
  }, [slots, user, selected]);

  function onFile(slotId: string, file: File) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, file, fileName: file.name, restoredNote: undefined } : s)));
    setMergedUrl(null); setZipUrl(null);
  }
  function removeFile(slotId: string) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, file: null, fileName: "" } : s)));
  }
  function rename(slotId: string, name: string) {
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, fileName: name } : s)));
  }
  function move(index: number, dir: -1 | 1) {
    setSlots((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function quickCompress(slotId: string) {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot?.file) return;
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "processing" } : s)));
    try {
      if (slot.file.type.startsWith("image/")) {
        const blob = await resizeAndCompressImage(slot.file, { maxSizeKB: 150 });
        const newFile = new File([blob], slot.file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" });
        setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, file: newFile, fileName: newFile.name, status: "idle" } : s)));
      } else {
        setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "idle" } : s)));
      }
    } catch {
      setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "idle" } : s)));
    }
  }

  async function convertToPdf(slotId: string) {
    const slot = slots.find((s) => s.id === slotId);
    if (!slot?.file || !slot.file.type.startsWith("image/")) return;
    setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "processing" } : s)));
    try {
      const bytes = await imageFileToPdfBytes(slot.file);
      const newFile = new File([bytes.buffer as ArrayBuffer], slot.file.name.replace(/\.[^.]+$/, ".pdf"), { type: "application/pdf" });
      setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, file: newFile, fileName: newFile.name, status: "idle" } : s)));
    } catch {
      setSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, status: "idle" } : s)));
    }
  }

  const filledSlots = slots.filter((s) => s.file);
  const missingRequired = slots.filter((s) => s.required && !s.file);

  async function createPack() {
    if (filledSlots.length === 0) return;
    setBuilding(true);
    setError(null);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const JSZip = (await import("jszip")).default;
      const merged = await PDFDocument.create();
      const zip = new JSZip();

      for (let i = 0; i < filledSlots.length; i++) {
        const slot = filledSlots[i];
        const file = slot.file!;
        const numberedName = `${String(i + 1).padStart(2, "0")}_${(slot.fileName || slot.label).replace(/\s+/g, "_")}`;

        if (file.type === "application/pdf") {
          const bytes = await file.arrayBuffer();
          zip.file(numberedName.endsWith(".pdf") ? numberedName : `${numberedName}.pdf`, bytes);
          const src = await PDFDocument.load(bytes);
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        } else if (file.type.startsWith("image/")) {
          const ext = file.name.split(".").pop() || "jpg";
          zip.file(numberedName.includes(".") ? numberedName : `${numberedName}.${ext}`, await file.arrayBuffer());
          const pdfBytes = await imageFileToPdfBytes(file);
          const src = await PDFDocument.load(pdfBytes);
          const pages = await merged.copyPages(src, src.getPageIndices());
          pages.forEach((p) => merged.addPage(p));
        } else {
          zip.file(numberedName, await file.arrayBuffer());
        }
      }

      const mergedBytes = await merged.save();
      setMergedUrl(URL.createObjectURL(new Blob([mergedBytes.buffer as ArrayBuffer], { type: "application/pdf" })));

      const zipBlob = await zip.generateAsync({ type: "blob" });
      setZipUrl(URL.createObjectURL(zipBlob));

      if (user && selected) await clearDocumentPackProgress(selected.slug);
    } catch {
      setError("Something went wrong creating the pack. Check that every uploaded file opens normally, then try again.");
    } finally {
      setBuilding(false);
    }
  }

  if (!selected) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Choose what you're preparing documents for — you'll get a checklist, a place to upload and process
          each file, and one organized download at the end.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => choosePack(pack)}
              className="focus-ring rounded-card border border-border bg-surface p-4 text-left shadow-soft transition-shadow hover:shadow-elevated"
            >
              <p className="font-semibold text-text">{pack.name}</p>
              <p className="mt-1 text-xs text-muted line-clamp-2">{pack.description}</p>
              <p className="mt-2 text-xs text-primary">{pack.required_documents.length} required document{pack.required_documents.length === 1 ? "" : "s"}</p>
            </button>
          ))}
        </div>
        {packs.length === 0 && <p className="text-sm text-muted">Loading templates…</p>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-text">{selected.name}</h2>
          <p className="text-sm text-muted">{selected.description}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>Choose different pack</Button>
      </div>

      {selected.disclaimer && <p className="rounded-control border border-warning/30 bg-warning/10 p-3 text-xs text-warning">{selected.disclaimer}</p>}
      {restoredBanner && (
        <p className="rounded-control border border-primary/30 bg-primary/10 p-3 text-xs text-text">
          Restored your checklist from where you left off. File uploads aren't saved between sessions, so
          please re-upload the files noted below.
        </p>
      )}
      {(selected.recommended_formats || selected.recommended_max_size) && (
        <p className="text-xs text-muted">
          {selected.recommended_formats && <>Recommended format: {selected.recommended_formats}. </>}
          {selected.recommended_max_size && <>Recommended size: {selected.recommended_max_size}.</>}
        </p>
      )}

      <div className="space-y-3">
        {slots.map((slot, i) => (
          <div key={slot.id} className="rounded-card border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">
                {slot.label} {slot.required ? <span className="text-danger">*</span> : <span className="text-xs text-muted">(optional)</span>}
              </p>
              {slot.file && (
                <div className="flex items-center gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-muted hover:text-text disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button onClick={() => move(i, 1)} disabled={i === slots.length - 1} className="text-muted hover:text-text disabled:opacity-30"><ArrowDown size={14} /></button>
                </div>
              )}
            </div>

            {!slot.file ? (
              <>
                {slot.restoredNote && <p className="mt-1 text-xs text-primary">{slot.restoredNote}</p>}
                <label className="focus-ring mt-2 flex cursor-pointer items-center gap-2 rounded-control border border-dashed border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:bg-surface">
                  <Upload size={14} /> Upload file
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(slot.id, e.target.files[0])} />
                </label>
              </>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <FileText size={14} className="text-primary" />
                  <input value={slot.fileName} onChange={(e) => rename(slot.id, e.target.value)} className="focus-ring flex-1 rounded-control border border-border bg-surface-2 px-2 py-1 text-xs" />
                  <span className="text-xs text-muted">{humanSize(slot.file.size)}</span>
                  <button onClick={() => removeFile(slot.id)} className="text-muted hover:text-danger"><X size={14} /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {slot.file.type.startsWith("image/") && (
                    <>
                      <button onClick={() => quickCompress(slot.id)} disabled={slot.status === "processing"} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface-2">Compress image</button>
                      <button onClick={() => convertToPdf(slot.id)} disabled={slot.status === "processing"} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted hover:bg-surface-2">Convert to PDF</button>
                    </>
                  )}
                  {slot.status === "processing" && <span className="text-xs text-muted">Processing…</span>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {missingRequired.length > 0 && (
        <p className="text-xs text-muted">Still needed: {missingRequired.map((s) => s.label).join(", ")}</p>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}

      <Button onClick={createPack} disabled={filledSlots.length === 0 || building}>
        {building ? "Creating pack…" : "Create Document Pack"}
      </Button>

      {(mergedUrl || zipUrl) && (
        <div className="rounded-card border border-success/30 bg-success/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-success"><Check size={16} /> Your document pack is ready.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {mergedUrl && <a href={mergedUrl} download={`${selected.slug}-merged.pdf`}><Button variant="secondary"><Download size={16} /> Download merged PDF</Button></a>}
            {zipUrl && <a href={zipUrl} download={`${selected.slug}-files.zip`}><Button variant="secondary"><Download size={16} /> Download ZIP (individual files)</Button></a>}
          </div>
        </div>
      )}
    </div>
  );
}
