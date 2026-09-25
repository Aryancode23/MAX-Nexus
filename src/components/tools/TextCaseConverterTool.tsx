"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/Button";

const CASES = [
  { label: "UPPERCASE", fn: (s: string) => s.toUpperCase() },
  { label: "lowercase", fn: (s: string) => s.toLowerCase() },
  { label: "Title Case", fn: (s: string) => s.replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1).toLowerCase()) },
  { label: "Sentence case", fn: (s: string) => s.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase()) },
];

export function TextCaseConverterTool() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-4">
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} placeholder="Paste or type text…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />
      <div className="flex flex-wrap gap-2">
        {CASES.map((c) => (
          <button key={c.label} onClick={() => setText(c.fn(text))} className="rounded-full border border-border bg-surface-2 px-3 py-1.5 text-sm hover:bg-surface">{c.label}</button>
        ))}
        <Button variant="secondary" size="sm" onClick={copy} className="ml-auto">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}
