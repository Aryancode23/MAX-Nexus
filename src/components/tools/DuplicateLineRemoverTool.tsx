"use client";
import { useState } from "react";
import { Button } from "@/components/Button";

export function DuplicateLineRemoverTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [removed, setRemoved] = useState<number | null>(null);

  function dedupe() {
    const lines = input.split("\n");
    const seen = new Set<string>();
    const result: string[] = [];
    for (const l of lines) { if (!seen.has(l)) { seen.add(l); result.push(l); } }
    setOutput(result.join("\n"));
    setRemoved(lines.length - result.length);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} placeholder="Paste lines…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />
      <textarea value={output} readOnly rows={12} placeholder="Unique lines will appear here…" className="w-full rounded-card border border-border bg-surface-2 p-4 text-sm" />
      <div className="flex items-center gap-3 md:col-span-2">
        <Button onClick={dedupe}>Remove duplicate lines</Button>
        {removed !== null && <span className="text-sm text-muted">Removed {removed} duplicate line(s)</span>}
      </div>
    </div>
  );
}
