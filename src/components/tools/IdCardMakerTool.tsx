"use client";
import { useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";
import { fileToDataUrl } from "@/lib/file-processing";

const CARD_W_MM = 85.6;
const CARD_H_MM = 54;

export function IdCardMakerTool() {
  const [orgName, setOrgName] = useState("Organization Name");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [validTill, setValidTill] = useState("");
  const [accent, setAccent] = useState("#4f46e5");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [copies, setCopies] = useState(2);
  const [exporting, setExporting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // data: URL, not blob: — blob: URLs can silently drop out of the
    // html2canvas-captured PDF even though they show fine in the preview.
    setPhotoUrl(await fileToDataUrl(file));
  }

  async function downloadPdf() {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageW = doc.internal.pageSize.getWidth();
      const marginX = (pageW - CARD_W_MM) / 2;
      let y = 15;

      for (let i = 0; i < copies; i++) {
        doc.setLineDashPattern([1.5, 1.5], 0);
        doc.rect(marginX, y, CARD_W_MM, CARD_H_MM);
        doc.addImage(imgData, "PNG", marginX, y, CARD_W_MM, CARD_H_MM);
        y += CARD_H_MM + 10;
      }

      doc.save(`${name || "id-card"}.pdf`);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-4">
        <Field label="Organization name" value={orgName} onChange={setOrgName} />
        <Field label="Full name" value={name} onChange={setName} />
        <Field label="Role / Class" value={role} onChange={setRole} placeholder="e.g. Class X-B or Accountant" />
        <Field label="ID number" value={idNumber} onChange={setIdNumber} />
        <Field label="Valid till" value={validTill} onChange={setValidTill} placeholder="e.g. March 2027" />

        <label className="flex items-center gap-2 text-sm">Accent color
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-8 w-8 rounded" />
        </label>

        <div>
          <p className="text-sm font-medium">Photo</p>
          <input type="file" accept="image/*" onChange={onPhoto} className="mt-1 text-sm" />
        </div>

        <label className="block max-w-[160px] text-sm">Copies per page
          <select value={copies} onChange={(e) => setCopies(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <option value={1}>1</option><option value={2}>2</option><option value={3}>3</option>
          </select>
        </label>

        <Button onClick={downloadPdf} disabled={exporting}><Download size={16} /> {exporting ? "Preparing…" : "Download ID card PDF"}</Button>
      </div>

      <div className="flex items-center justify-center rounded-card border border-border bg-surface-2 p-8">
        <div
          ref={cardRef}
          style={{ width: 340, height: 214, borderRadius: 12, overflow: "hidden" }}
          className="bg-white text-black shadow-soft"
        >
          <div style={{ backgroundColor: accent, height: 56 }} className="flex items-center px-4">
            <p className="truncate text-sm font-bold text-white">{orgName}</p>
          </div>
          <div className="flex gap-3 p-4">
            <div style={{ borderColor: accent }} className="h-20 w-16 shrink-0 overflow-hidden rounded border-2 bg-gray-100">
              {photoUrl ? <img src={photoUrl} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[9px] text-gray-400">Photo</div>}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate text-sm font-bold">{name || "Full Name"}</p>
              <p className="truncate text-gray-500">{role || "Role / Class"}</p>
              <p className="mt-1 truncate">ID: {idNumber || "—"}</p>
              {validTill && <p className="truncate text-gray-500">Valid till: {validTill}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block text-sm">
      {label}
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}
