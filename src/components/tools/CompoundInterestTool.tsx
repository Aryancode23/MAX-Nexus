"use client";
import { useState } from "react";

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }

const FREQUENCIES = [
  { label: "Annually", n: 1 },
  { label: "Half-yearly", n: 2 },
  { label: "Quarterly", n: 4 },
  { label: "Monthly", n: 12 },
];

export function CompoundInterestTool() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("3");
  const [freq, setFreq] = useState(FREQUENCIES[2]);

  const P = Number(principal), R = Number(rate), T = Number(years);
  const amount = P * Math.pow(1 + (R / 100) / freq.n, freq.n * T);
  const interest = amount - P;

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-3">
        <label className="text-sm block">Principal (₹)<input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Rate of interest (% per year)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Time (years)<input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <div>
          <p className="text-sm">Compounding frequency</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (<button key={f.label} onClick={() => setFreq(f)} className={`rounded-full border border-border px-3 py-1.5 text-sm ${freq.label === f.label ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{f.label}</button>))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-control border border-border bg-primary/10 p-3"><p className="text-xs text-muted">Compound Interest</p><p className="text-2xl font-bold text-primary">₹{inr(interest)}</p></div>
        <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Maturity Amount</p><p className="text-lg font-semibold text-text">₹{inr(amount)}</p></div>
      </div>
    </div>
  );
}
