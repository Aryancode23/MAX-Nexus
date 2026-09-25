"use client";
import { useState } from "react";
import { Button } from "@/components/Button";

export function RemoveExtraSpacesTool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function clean() {
    setOutput(input.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").split("\n").map((l) => l.trim()).join("\n").trim());
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <textarea value={input} onChange={(e) => setInput(e.target.value)} rows={12} placeholder="Paste messy text…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />
      <textarea value={output} readOnly rows={12} placeholder="Cleaned text will appear here…" className="w-full rounded-card border border-border bg-surface-2 p-4 text-sm" />
      <Button onClick={clean} className="md:col-span-2">Remove extra spaces</Button>
    </div>
  );
}
