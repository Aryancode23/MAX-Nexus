"use client";
import { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";

interface Question { id: string; text: string; marks: number; }
interface Section { id: string; title: string; instructions: string; questions: Question[]; }

function emptyQuestion(): Question { return { id: crypto.randomUUID(), text: "", marks: 1 }; }
function emptySection(): Section { return { id: crypto.randomUUID(), title: "Section A", instructions: "", questions: [emptyQuestion()] }; }

export function QuestionPaperMakerTool() {
  const [schoolName, setSchoolName] = useState("");
  const [examTitle, setExamTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [duration, setDuration] = useState("3 Hours");
  const [totalMarks, setTotalMarks] = useState(100);
  const [generalInstructions, setGeneralInstructions] = useState("");
  const [sections, setSections] = useState<Section[]>([emptySection()]);

  function updateSection(id: string, field: keyof Section, value: any) {
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  }
  function updateQuestion(sectionId: string, qId: string, field: keyof Question, value: any) {
    setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, questions: s.questions.map((q) => q.id === qId ? { ...q, [field]: value } : q) } : s));
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const marginX = 50;
    const pageWidth = doc.internal.pageSize.getWidth() - marginX * 2;
    let y = 56;

    doc.setFont("helvetica", "bold"); doc.setFontSize(16);
    doc.text(schoolName || "School Name", doc.internal.pageSize.getWidth() / 2, y, { align: "center" }); y += 22;
    doc.setFontSize(13);
    doc.text(examTitle || "Examination", doc.internal.pageSize.getWidth() / 2, y, { align: "center" }); y += 20;

    doc.setFont("helvetica", "normal"); doc.setFontSize(10);
    doc.text(`Subject: ${subject || "-"}`, marginX, y);
    doc.text(`Class: ${className || "-"}`, marginX + pageWidth / 2, y); y += 14;
    doc.text(`Duration: ${duration}`, marginX, y);
    doc.text(`Maximum Marks: ${totalMarks}`, marginX + pageWidth / 2, y); y += 18;

    doc.setDrawColor(180); doc.line(marginX, y, marginX + pageWidth, y); y += 16;

    if (generalInstructions) {
      doc.setFont("helvetica", "bold"); doc.text("General Instructions:", marginX, y); y += 14;
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(generalInstructions, pageWidth);
      doc.text(lines, marginX, y); y += lines.length * 13 + 10;
    }

    function pageBreak(needed = 60) {
      if (y > doc.internal.pageSize.getHeight() - needed) { doc.addPage(); y = 56; }
    }

    sections.forEach((section) => {
      pageBreak(100);
      doc.setFont("helvetica", "bold"); doc.setFontSize(12);
      doc.text(section.title, marginX, y); y += 16;
      if (section.instructions) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(9.5);
        const lines = doc.splitTextToSize(section.instructions, pageWidth);
        doc.text(lines, marginX, y); y += lines.length * 12 + 8;
      }
      doc.setFont("helvetica", "normal"); doc.setFontSize(10.5);
      section.questions.forEach((q, i) => {
        pageBreak();
        const qText = `${i + 1}. ${q.text || "..."}`;
        const marksText = `[${q.marks}]`;
        const lines = doc.splitTextToSize(qText, pageWidth - 40);
        doc.text(lines, marginX, y);
        doc.text(marksText, marginX + pageWidth - doc.getTextWidth(marksText), y);
        y += lines.length * 14 + 8;
      });
      y += 6;
    });

    doc.save(`${examTitle || "question-paper"}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="School / Institute name" value={schoolName} onChange={setSchoolName} />
        <Field label="Exam title" value={examTitle} onChange={setExamTitle} placeholder="e.g. Half-Yearly Examination 2026" />
        <Field label="Subject" value={subject} onChange={setSubject} />
        <Field label="Class / Section" value={className} onChange={setClassName} />
        <Field label="Duration" value={duration} onChange={setDuration} />
        <label className="block text-sm">Total marks
          <input type="number" value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>
      <label className="block text-sm">General instructions
        <textarea value={generalInstructions} onChange={(e) => setGeneralInstructions(e.target.value)} rows={2} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      {sections.map((section) => (
        <div key={section.id} className="rounded-card border border-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Section title" value={section.title} onChange={(v) => updateSection(section.id, "title", v)} />
            <Field label="Section instructions" value={section.instructions} onChange={(v) => updateSection(section.id, "instructions", v)} />
          </div>
          <div className="mt-3 space-y-2">
            {section.questions.map((q) => (
              <div key={q.id} className="flex gap-2">
                <textarea
                  value={q.text}
                  onChange={(e) => updateQuestion(section.id, q.id, "text", e.target.value)}
                  placeholder="Question text"
                  rows={2}
                  className="focus-ring flex-1 rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
                />
                <input
                  type="number"
                  value={q.marks}
                  onChange={(e) => updateQuestion(section.id, q.id, "marks", Number(e.target.value))}
                  className="focus-ring w-16 rounded-control border border-border bg-surface px-2 py-1.5 text-sm"
                  title="Marks"
                />
                <button onClick={() => updateSection(section.id, "questions", section.questions.filter((x) => x.id !== q.id))} className="text-muted hover:text-danger"><Trash2 size={14} /></button>
              </div>
            ))}
            <button onClick={() => updateSection(section.id, "questions", [...section.questions, emptyQuestion()])} className="focus-ring flex items-center gap-1 text-xs text-primary"><Plus size={14} /> Add question</button>
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button onClick={() => setSections([...sections, emptySection()])} className="focus-ring flex items-center gap-1 text-sm text-primary"><Plus size={14} /> Add section</button>
        <Button onClick={downloadPdf} className="ml-auto"><Download size={16} /> Download PDF</Button>
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
