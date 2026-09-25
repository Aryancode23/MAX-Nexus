"use client";

import { useRef, useState } from "react";
import { Download, Upload, Trash2, RectangleHorizontal, RectangleVertical } from "lucide-react";
import { Button } from "@/components/Button";
import { CARD_TEMPLATES } from "./idcard/cardTemplates";
import { DraggableElement, type CardElement } from "./idcard/DraggableElement";
import { BACKGROUND_PRESETS } from "./idcardv2/backgroundPresets";
import { fileToDataUrl } from "@/lib/file-processing";

const CARD_LONG_MM = 85.6;
const CARD_SHORT_MM = 54;
const PREVIEW_LONG = 349;

type SlotKey = "photo" | "signature" | "logo" | "stamp";

const SLOT_DEFAULTS: Record<SlotKey, Omit<CardElement, "id" | "imageUrl">> = {
  photo: { x: 30, y: 14, size: 90, shape: "circle" },
  logo: { x: 6, y: 6, size: 36, shape: "square" },
  signature: { x: 10, y: 74, size: 90, shape: "free" },
  stamp: { x: 62, y: 64, size: 56, shape: "circle" },
};

const SLOT_LABELS: Record<SlotKey, string> = {
  photo: "Employee Photo",
  signature: "Employee Signature",
  logo: "Organization Logo",
  stamp: "Institution Seal / Authorized Signature",
};

export function EmployeeIdCardStudioTool() {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");
  const [templateId, setTemplateId] = useState(CARD_TEMPLATES[0].id);
  const template = CARD_TEMPLATES.find((t) => t.id === templateId)!;
  const [customBackground, setCustomBackground] = useState<string | null>(null);
  const activeBackground = customBackground ?? template.background;

  const [orgName, setOrgName] = useState("Organization Name");
  const [employeeName, setEmployeeName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [validTill, setValidTill] = useState("");

  const [fontSizes, setFontSizes] = useState({ org: 11, name: 14, sub: 10, valid: 9 });

  const [elements, setElements] = useState<Partial<Record<SlotKey, CardElement>>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copies, setCopies] = useState(2);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const cardWMm = orientation === "portrait" ? CARD_SHORT_MM : CARD_LONG_MM;
  const cardHMm = orientation === "portrait" ? CARD_LONG_MM : CARD_SHORT_MM;
  const previewW = orientation === "portrait" ? Math.round(PREVIEW_LONG * (CARD_SHORT_MM / CARD_LONG_MM)) : PREVIEW_LONG;
  const previewH = orientation === "portrait" ? PREVIEW_LONG : Math.round(PREVIEW_LONG * (CARD_SHORT_MM / CARD_LONG_MM));

  async function onUpload(slot: SlotKey, file: File) {
    // A base64 data: URL, not a blob: object URL — blob: URLs don't
    // reliably survive being captured by html2canvas at export time
    // (see downloadPdf below), so the photo/logo would render fine in
    // the live preview but silently disappear from the downloaded PDF.
    const url = await fileToDataUrl(file);
    setElements((prev) => ({ ...prev, [slot]: { id: slot, imageUrl: url, ...SLOT_DEFAULTS[slot] } }));
  }
  function removeSlot(slot: SlotKey) {
    setElements((prev) => { const next = { ...prev }; delete next[slot]; return next; });
    if (selectedId === slot) setSelectedId(null);
  }
  function moveElement(slot: SlotKey, x: number, y: number) {
    setElements((prev) => (prev[slot] ? { ...prev, [slot]: { ...prev[slot]!, x, y } } : prev));
  }
  function resizeSelected(size: number) {
    if (!selectedId) return;
    setElements((prev) => {
      const key = selectedId as SlotKey;
      if (!prev[key]) return prev;
      return { ...prev, [key]: { ...prev[key]!, size } };
    });
  }

  const textColorClass = template.textColor === "light" ? "text-white" : "text-gray-900";
  const subTextClass = template.textColor === "light" ? "text-white/80" : "text-gray-600";

  async function downloadPdf() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const prevSelected = selectedId;
      setSelectedId(null);
      await new Promise((r) => setTimeout(r, 50));

      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      setSelectedId(prevSelected);

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const marginX = (pageW - cardWMm) / 2;
      let y = 15;

      for (let i = 0; i < copies; i++) {
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.rect(marginX, y, cardWMm, cardHMm);
        doc.addImage(imgData, "PNG", marginX, y, cardWMm, cardHMm);
        y += cardHMm + 10;
      }

      doc.save(`${employeeName || "id-card"}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  const selectedSlot = selectedId as SlotKey | null;
  const selectedElement = selectedSlot ? elements[selectedSlot] : null;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-text">Orientation</p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setOrientation("portrait")} className={`flex items-center gap-1 rounded-control border border-border px-3 py-1.5 text-xs ${orientation === "portrait" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><RectangleVertical size={13} /> Portrait</button>
            <button onClick={() => setOrientation("landscape")} className={`flex items-center gap-1 rounded-control border border-border px-3 py-1.5 text-xs ${orientation === "landscape" ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}><RectangleHorizontal size={13} /> Landscape</button>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Template ({CARD_TEMPLATES.length} available)</p>
          <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-5">
            {CARD_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => { setTemplateId(t.id); setCustomBackground(null); }}
                title={t.name}
                className={`h-12 rounded-control border-2 ${templateId === t.id && !customBackground ? "border-primary" : "border-transparent"}`}
                style={{ background: t.background }}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">{customBackground ? "Custom background" : template.name}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Custom background</p>
          <div className="mt-2 grid grid-cols-8 gap-1.5">
            {BACKGROUND_PRESETS.map((p) => (
              <button key={p.id} title={p.name} onClick={() => setCustomBackground(p.css)} className="h-8 rounded-control border border-border hover:ring-2 hover:ring-primary" style={{ background: p.css }} />
            ))}
          </div>
          <input
            type="color"
            onChange={(e) => setCustomBackground(e.target.value)}
            className="mt-2 h-8 w-full rounded-control border border-border"
            title="Pick any custom color"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Organization name" value={orgName} onChange={setOrgName} />
          <Field label="Employee name" value={employeeName} onChange={setEmployeeName} />
          <Field label="Designation" value={designation} onChange={setDesignation} />
          <Field label="Department (optional)" value={department} onChange={setDepartment} />
          <Field label="Employee ID" value={employeeId} onChange={setEmployeeId} />
          <Field label="Valid till" value={validTill} onChange={setValidTill} />
        </div>

        <div>
          <p className="text-sm font-semibold text-text">Text size</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <SizeSlider label="Organization name" value={fontSizes.org} onChange={(v) => setFontSizes((f) => ({ ...f, org: v }))} min={8} max={18} />
            <SizeSlider label="Employee name" value={fontSizes.name} onChange={(v) => setFontSizes((f) => ({ ...f, name: v }))} min={10} max={22} />
            <SizeSlider label="Designation / ID" value={fontSizes.sub} onChange={(v) => setFontSizes((f) => ({ ...f, sub: v }))} min={7} max={16} />
            <SizeSlider label="Valid till" value={fontSizes.valid} onChange={(v) => setFontSizes((f) => ({ ...f, valid: v }))} min={6} max={14} />
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-semibold text-text">Images — click to upload, then drag on the card to position</p>
          {(Object.keys(SLOT_LABELS) as SlotKey[]).map((slot) => (
            <div key={slot} className="flex items-center justify-between gap-2 rounded-control border border-border p-2">
              <span className="text-xs text-text">{SLOT_LABELS[slot]}{slot === "photo" && <span className="text-danger"> *</span>}</span>
              <div className="flex items-center gap-2">
                {elements[slot] && (
                  <button onClick={() => removeSlot(slot)} className="text-muted hover:text-danger"><Trash2 size={13} /></button>
                )}
                <label className="focus-ring flex cursor-pointer items-center gap-1 rounded-control border border-border bg-surface-2 px-2 py-1 text-xs hover:bg-surface">
                  <Upload size={12} /> {elements[slot] ? "Replace" : "Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUpload(slot, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}
        </div>

        {selectedElement && (
          <label className="block max-w-xs text-sm">
            Size of selected image ({selectedElement.size}px)
            <input type="range" min={30} max={160} value={selectedElement.size} onChange={(e) => resizeSelected(Number(e.target.value))} className="mt-1 w-full" />
          </label>
        )}

        <label className="block max-w-[160px] text-sm">Copies per page
          <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </select>
        </label>

        <Button onClick={downloadPdf} disabled={exporting || !elements.photo}>
          <Download size={16} /> {exporting ? "Preparing…" : "Download ID card PDF"}
        </Button>
        {!elements.photo && <p className="text-xs text-muted">Upload an employee photo to enable export.</p>}
      </div>

      <div className="flex items-start justify-center rounded-card border border-border bg-surface-2 p-8">
        <div
          ref={cardRef}
          onPointerDown={() => setSelectedId(null)}
          style={{ width: previewW, height: previewH, background: activeBackground, position: "relative", borderRadius: 14, overflow: "hidden" }}
          className="shadow-soft"
        >
          <div className="absolute inset-x-0 top-0 p-3 text-center">
            <p className={`truncate font-bold uppercase tracking-wide ${textColorClass}`} style={{ fontSize: fontSizes.org }}>{orgName}</p>
          </div>

          {(Object.keys(SLOT_LABELS) as SlotKey[]).map((slot) => {
            const el = elements[slot];
            if (!el) return null;
            return (
              <DraggableElement
                key={slot}
                element={el}
                cardWidth={previewW}
                cardHeight={previewH}
                selected={selectedId === slot}
                onSelect={() => setSelectedId(slot)}
                onMove={(x, y) => moveElement(slot, x, y)}
              />
            );
          })}

          <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-3 text-center">
            <p className={`truncate font-bold ${textColorClass}`} style={{ fontSize: fontSizes.name }}>{employeeName || "Employee Name"}</p>
            <p className={`truncate ${subTextClass}`} style={{ fontSize: fontSizes.sub }}>{designation || "Designation"}{department && ` · ${department}`}</p>
            <p className={`truncate ${subTextClass}`} style={{ fontSize: fontSizes.sub }}>ID: {employeeId || "—"}</p>
            {validTill && <p className={`truncate ${subTextClass}`} style={{ fontSize: fontSizes.valid }}>Valid till: {validTill}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}

function SizeSlider({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <label className="block text-xs">
      {label} ({value}px)
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="mt-1 w-full" />
    </label>
  );
}
