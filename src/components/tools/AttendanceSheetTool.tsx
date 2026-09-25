"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";

export function AttendanceSheetTool() {
  const [className, setClassName] = useState("");
  const [month, setMonth] = useState("");
  const [days, setDays] = useState(30);
  const [studentsText, setStudentsText] = useState("");

  const students = studentsText.split("\n").map((s) => s.trim()).filter(Boolean);

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" }) as any;

    doc.setFontSize(14);
    doc.text(`Attendance Sheet — ${className || "Class"} — ${month || ""}`, 40, 30);

    const head = [["#", "Student Name", ...Array.from({ length: days }, (_, i) => String(i + 1))]];
    const body = students.map((name, i) => [String(i + 1), name, ...Array.from({ length: days }, () => "")]);

    doc.autoTable({
      startY: 45,
      head,
      body,
      styles: { fontSize: 7, cellPadding: 3, halign: "center" },
      columnStyles: { 1: { halign: "left", cellWidth: 120 } },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 20, right: 20 },
    });

    doc.save(`attendance-${className || "class"}.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-sm">Class / Section
          <input value={className} onChange={(e) => setClassName(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Month / Period
          <input value={month} onChange={(e) => setMonth(e.target.value)} placeholder="e.g. March 2026" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm">Number of days
          <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} min={1} max={31} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        </label>
      </div>

      <label className="block text-sm">Student names (one per line)
        <textarea value={studentsText} onChange={(e) => setStudentsText(e.target.value)} rows={10} placeholder={"Aarav Sharma\nPriya Singh\n..."} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <p className="text-sm text-muted">{students.length} student{students.length === 1 ? "" : "s"} · {days} day columns</p>

      <Button onClick={downloadPdf} disabled={students.length === 0}><Download size={16} /> Download attendance sheet PDF</Button>
    </div>
  );
}
