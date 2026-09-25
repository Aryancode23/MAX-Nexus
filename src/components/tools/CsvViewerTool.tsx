"use client";
import { useState } from "react";
import { Download } from "lucide-react";
import { FileDropZone } from "./FileDropZone";
import { Button } from "@/components/Button";

export function CsvViewerTool() {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [fileName, setFileName] = useState("data");
  const [error, setError] = useState<string | null>(null);

  async function loadFile(files: File[]) {
    const file = files[0];
    if (!file) return;
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    try {
      const Papa = (await import("papaparse")).default;
      const text = await file.text();
      const result = Papa.parse<string[]>(text.trim(), { skipEmptyLines: true });
      if (result.data.length === 0) throw new Error("empty");
      setHeaders(result.data[0]);
      setRows(result.data.slice(1));
      setError(null);
    } catch {
      setError("Couldn't read this file as CSV. Make sure it's a valid comma-separated file.");
    }
  }

  async function downloadPdf() {
    const { jsPDF } = await import("jspdf");
    await import("jspdf-autotable");
    const doc = new jsPDF({ orientation: headers.length > 6 ? "landscape" : "portrait", unit: "pt" }) as any;
    doc.autoTable({ head: [headers], body: rows, styles: { fontSize: 8 }, headStyles: { fillColor: [79, 70, 229] } });
    doc.save(`${fileName}.pdf`);
  }

  return (
    <div className="space-y-6">
      {headers.length === 0 && <FileDropZone accept=".csv,text/csv" onFiles={loadFile} label="Click to upload or drag and drop a CSV file" />}
      {error && <p className="text-sm text-danger">{error}</p>}

      {headers.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-muted">{rows.length} rows · {headers.length} columns</p>
          <div className="max-h-96 overflow-auto rounded-card border border-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-surface-2">
                <tr>{headers.map((h, i) => <th key={i} className="border-b border-border px-3 py-2 font-semibold text-text">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="odd:bg-surface even:bg-surface-2">
                    {row.map((cell, j) => <td key={j} className="border-b border-border px-3 py-1.5 text-muted">{cell}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={downloadPdf} variant="secondary"><Download size={16} /> Export as PDF</Button>
            <Button variant="secondary" onClick={() => { setHeaders([]); setRows([]); }}>Choose another file</Button>
          </div>
        </div>
      )}
    </div>
  );
}
