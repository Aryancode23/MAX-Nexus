"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_PERIODS = ["9:00–9:45", "9:45–10:30", "10:30–11:15", "11:30–12:15", "12:15–1:00", "2:00–2:45"];

export function TimetableMakerTool() {
  const [title, setTitle] = useState("Class Timetable");
  const [days, setDays] = useState(DEFAULT_DAYS);
  const [periods, setPeriods] = useState(DEFAULT_PERIODS);
  const [grid, setGrid] = useState<string[][]>(
    Array.from({ length: DEFAULT_PERIODS.length }, () => Array(DEFAULT_DAYS.length).fill(""))
  );

  function updateCell(row: number, col: number, value: string) {
    setGrid((prev) => prev.map((r, ri) => (ri === row ? r.map((c, ci) => (ci === col ? value : c)) : r)));
  }
  function updatePeriod(i: number, value: string) {
    setPeriods((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  }
  function updateDay(i: number, value: string) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? value : d)));
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: "landscape", unit: "pt" }) as any;
    doc.setFontSize(16);
    doc.text(title, 40, 35);

    doc.autoTable({
      startY: 50,
      head: [["Period", ...days]],
      body: periods.map((p, ri) => [p, ...grid[ri]]),
      styles: { fontSize: 9, cellPadding: 6, halign: "center" },
      columnStyles: { 0: { halign: "left", fontStyle: "bold" } },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 30, right: 30 },
    });

    doc.save(`${title || "timetable"}.pdf`);
  }

  return (
    <div className="space-y-6">
      <label className="block max-w-md text-sm">Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
      </label>

      <div className="overflow-x-auto">
        <table className="border-collapse text-xs">
          <thead>
            <tr>
              <th className="border border-border bg-surface-2 p-1">Period</th>
              {days.map((d, i) => (
                <th key={i} className="border border-border bg-surface-2 p-1">
                  <input value={d} onChange={(e) => updateDay(i, e.target.value)} className="w-24 bg-transparent text-center text-xs font-semibold" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((p, ri) => (
              <tr key={ri}>
                <td className="border border-border p-1">
                  <input value={p} onChange={(e) => updatePeriod(ri, e.target.value)} className="w-24 bg-transparent text-xs" />
                </td>
                {days.map((_, ci) => (
                  <td key={ci} className="border border-border p-1">
                    <input
                      value={grid[ri][ci]}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder="Subject"
                      className="focus-ring w-24 rounded bg-surface px-1 py-1 text-xs"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setPeriods([...periods, ""]); setGrid([...grid, Array(days.length).fill("")]); }}
          className="text-sm text-primary hover:underline"
        >
          + Add period row
        </button>
        <Button onClick={downloadPdf} className="ml-auto"><Download size={16} /> Download timetable PDF</Button>
      </div>
    </div>
  );
}
