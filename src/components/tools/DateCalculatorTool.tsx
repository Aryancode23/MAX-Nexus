"use client";
import { useState } from "react";

export function DateCalculatorTool() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  let days: number | null = null;
  if (from && to) {
    days = Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86400000);
  }

  return (
    <div className="max-w-md space-y-4">
      <label className="block text-sm">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      <label className="block text-sm">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      {days !== null && (
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-bold text-text">{Math.abs(days)} days</p>
          <p className="text-xs text-muted">{(Math.abs(days) / 7).toFixed(1)} weeks · {(Math.abs(days) / 365.25).toFixed(2)} years</p>
        </div>
      )}
    </div>
  );
}
