"use client";
import { useState } from "react";

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }

export function SimpleInterestTool() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("3");

  const P = Number(principal), R = Number(rate), T = Number(years);
  const interest = (P * R * T) / 100;

  return (
    <div className="max-w-md space-y-6">
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm">Principal (₹)<input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm">Rate of interest (% per year)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm">Time (years)<input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      </div>
      <div className="space-y-3">
        <div className="rounded-control border border-border bg-primary/10 p-3"><p className="text-xs text-muted">Simple Interest</p><p className="text-2xl font-bold text-primary">₹{inr(interest)}</p></div>
        <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Total Amount</p><p className="text-lg font-semibold text-text">₹{inr(P + interest)}</p></div>
      </div>
    </div>
  );
}
