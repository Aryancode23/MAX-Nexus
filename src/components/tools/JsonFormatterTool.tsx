"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/Button";

export function JsonFormatterTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function format(minify = false) {
    try {
      const parsed = JSON.parse(input);
      setOutput(minify ? JSON.stringify(parsed) : JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError("Invalid JSON — " + (e?.message ?? "please check the syntax."));
      setOutput("");
    }
  }

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={16} placeholder="Paste JSON here…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 font-mono text-xs" />
      <div className="space-y-2">
        <textarea value={output} readOnly rows={16} placeholder="Formatted JSON will appear here…" className="w-full rounded-card border border-border bg-surface-2 p-4 font-mono text-xs" />
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <div className="flex flex-wrap gap-3 md:col-span-2">
        <Button onClick={() => format(false)}>Format / Prettify</Button>
        <Button variant="secondary" onClick={() => format(true)}>Minify</Button>
        <Button variant="secondary" onClick={copy} disabled={!output}>{copied ? <Check size={14} /> : <Copy size={14} />} Copy</Button>
      </div>
    </div>
  );
}
