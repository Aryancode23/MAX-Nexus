"use client";
import { useState } from "react";
import { Button } from "@/components/Button";

interface DiffLine { type: "same" | "added" | "removed"; text: string; }

function diffLines(a: string[], b: string[]): DiffLine[] {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const result: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { result.push({ type: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { result.push({ type: "removed", text: a[i] }); i++; }
    else { result.push({ type: "added", text: b[j] }); j++; }
  }
  while (i < m) { result.push({ type: "removed", text: a[i] }); i++; }
  while (j < n) { result.push({ type: "added", text: b[j] }); j++; }
  return result;
}

export function TextDiffTool() {
  const [original, setOriginal] = useState("");
  const [changed, setChanged] = useState("");
  const [diff, setDiff] = useState<DiffLine[] | null>(null);

  function compare() {
    setDiff(diffLines(original.split("\n"), changed.split("\n")));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <textarea value={original} onChange={(e) => setOriginal(e.target.value)} rows={10} placeholder="Original text…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />
        <textarea value={changed} onChange={(e) => setChanged(e.target.value)} rows={10} placeholder="Changed text…" className="focus-ring w-full rounded-card border border-border bg-surface p-4 text-sm" />
      </div>
      <Button onClick={compare}>Compare</Button>
      {diff && (
        <div className="rounded-card border border-border bg-surface p-4 font-mono text-xs">
          {diff.map((line, i) => (
            <div key={i} className={
              line.type === "added" ? "bg-success/10 text-success" :
              line.type === "removed" ? "bg-danger/10 text-danger line-through" : "text-text"
            }>
              {line.type === "added" ? "+ " : line.type === "removed" ? "- " : "  "}{line.text || " "}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
