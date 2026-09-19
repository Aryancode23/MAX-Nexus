"use client";

import { useState } from "react";
import { Download, Check } from "lucide-react";
import { Button } from "@/components/Button";
import { CHECKLISTS, CATEGORIES, type ChecklistItem } from "./checklists/checklistData";

export function DocumentChecklistTool() {
  const [category, setCategory] = useState<ChecklistItem["category"]>("Banking");
  const [selectedId, setSelectedId] = useState(CHECKLISTS.find((c) => c.category === "Banking")!.id);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const inCategory = CHECKLISTS.filter((c) => c.category === category);
  const selected = CHECKLISTS.find((c) => c.id === selectedId) ?? inCategory[0];

  function toggle(doc: string) {
    setChecked((prev) => ({ ...prev, [doc]: !prev[doc] }));
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 56;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    let y = 64;

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text(selected.title, marginX, y); y += 20;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`${selected.category} · Document Checklist`, marginX, y); y += 24;
    doc.setTextColor(20);

    doc.setFontSize(11);
    selected.documents.forEach((item, i) => {
      const lines = doc.splitTextToSize(`☐  ${item}`, pageWidth);
      doc.text(lines, marginX, y);
      y += lines.length * 15 + 6;
    });

    if (selected.notes) {
      y += 10;
      doc.setFont("helvetica", "italic"); doc.setFontSize(9); doc.setTextColor(100);
      const noteLines = doc.splitTextToSize(`Note: ${selected.notes}`, pageWidth);
      doc.text(noteLines, marginX, y);
    }

    doc.save(`${selected.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-checklist.pdf`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div>
        <p className="text-sm font-semibold text-text">Category</p>
        <div className="mt-2 flex flex-col gap-1">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCategory(c); const first = CHECKLISTS.find((x) => x.category === c)!; setSelectedId(first.id); setChecked({}); }}
              className={`rounded-control px-3 py-2 text-left text-sm ${category === c ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface-2"}`}
            >
              {c}
            </button>
          ))}
        </div>

        <p className="mt-5 text-sm font-semibold text-text">Checklist</p>
        <div className="mt-2 flex flex-col gap-1">
          {inCategory.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedId(c.id); setChecked({}); }}
              className={`rounded-control px-3 py-2 text-left text-xs ${selectedId === c.id ? "bg-surface-2 font-medium text-text" : "text-muted hover:bg-surface-2"}`}
            >
              {c.title}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="text-lg font-bold text-text">{selected.title}</h2>
        <p className="text-xs text-muted">{selected.category} · Document Checklist</p>

        <ul className="mt-5 space-y-2">
          {selected.documents.map((doc) => (
            <li key={doc}>
              <button onClick={() => toggle(doc)} className="focus-ring flex w-full items-start gap-2 rounded-control p-2 text-left text-sm hover:bg-surface-2">
                <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked[doc] ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                  {checked[doc] && <Check size={12} />}
                </span>
                <span className={checked[doc] ? "text-muted line-through" : "text-text"}>{doc}</span>
              </button>
            </li>
          ))}
        </ul>

        {selected.notes && <p className="mt-4 rounded-control border border-border bg-surface-2 p-3 text-xs text-muted">{selected.notes}</p>}

        <p className="mt-4 text-xs text-muted">
          This is a general checklist for planning purposes — exact requirements can vary by bank, state, or
          office. Always confirm with the specific institution before your visit.
        </p>

        <Button onClick={downloadPdf} variant="secondary" className="mt-4">
          <Download size={16} /> Download as PDF
        </Button>
      </div>
    </div>
  );
}
