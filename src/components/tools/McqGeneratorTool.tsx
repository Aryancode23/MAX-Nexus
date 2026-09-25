"use client";
import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

interface Mcq { id: string; question: string; options: string[]; correct: number; }

function emptyMcq(): Mcq { return { id: crypto.randomUUID(), question: "", options: ["", "", "", ""], correct: 0 }; }

export function McqGeneratorTool() {
  const [title, setTitle] = useState("Quiz Sheet");
  const [mcqs, setMcqs] = useState<Mcq[]>([emptyMcq()]);

  function update(id: string, field: keyof Mcq, value: any) {
    setMcqs((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));
  }
  function updateOption(id: string, index: number, value: string) {
    setMcqs((prev) => prev.map((m) => (m.id === id ? { ...m, options: m.options.map((o, i) => (i === index ? value : o)) } : m)));
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 50;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    let y = 56;

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text(title, marginX, y); y += 26;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);

    mcqs.forEach((m, i) => {
      if (y > doc.internal.pageSize.getHeight() - 100) { doc.addPage(); y = 56; }
      const qLines = doc.splitTextToSize(`${i + 1}. ${m.question || "..."}`, pageWidth);
      doc.setFont("helvetica", "bold");
      doc.text(qLines, marginX, y); y += qLines.length * 14 + 4;
      doc.setFont("helvetica", "normal");
      m.options.forEach((opt, oi) => {
        const label = String.fromCharCode(65 + oi);
        doc.text(`(${label}) ${opt || "-"}`, marginX + 15, y);
        y += 14;
      });
      y += 10;
    });

    doc.addPage();
    y = 56;
    doc.setFont("helvetica", "bold"); doc.setFontSize(14);
    doc.text("Answer Key", marginX, y); y += 22;
    doc.setFont("helvetica", "normal"); doc.setFontSize(11);
    mcqs.forEach((m, i) => {
      if (y > doc.internal.pageSize.getHeight() - 40) { doc.addPage(); y = 56; }
      doc.text(`${i + 1}. ${String.fromCharCode(65 + m.correct)}`, marginX, y);
      y += 16;
    });

    doc.save(`${title || "quiz"}.pdf`);
  }

  return (
    <div className="space-y-6">
      <label className="block max-w-md text-sm">Sheet title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      {mcqs.map((m, i) => (
        <div key={m.id} className="rounded-card border border-border p-4">
          <div className="flex items-start justify-between gap-2">
            <textarea
              value={m.question}
              onChange={(e) => update(m.id, "question", e.target.value)}
              placeholder={`Question ${i + 1}`}
              rows={2}
              className="focus-ring flex-1 rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
            />
            <button onClick={() => setMcqs(mcqs.filter((x) => x.id !== m.id))} className="mt-1 text-muted hover:text-danger"><Trash2 size={14} /></button>
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {m.options.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-2 text-sm">
                <input type="radio" checked={m.correct === oi} onChange={() => update(m.id, "correct", oi)} />
                <input
                  value={opt}
                  onChange={(e) => updateOption(m.id, oi, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                  className="focus-ring flex-1 rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
                />
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-muted">Select the radio button next to the correct answer.</p>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => setMcqs([...mcqs, emptyMcq()])} className="focus-ring flex items-center gap-1 text-sm text-primary"><Plus size={14} /> Add question</button>
        <Button onClick={downloadPdf} className="ml-auto"><Download size={16} /> Download PDF (with answer key)</Button>
      </div>
    </div>
  );
}
