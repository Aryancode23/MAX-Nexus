"use client";
import { useState } from "react";

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }

const FREQUENCIES = [
  { label: "Quarterly", n: 4 },
  { label: "Half-yearly", n: 2 },
  { label: "Annually", n: 1 },
  { label: "Monthly", n: 12 },
];

export function FdCalculatorTool() {
  const [principal, setPrincipal] = useState("100000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("2");
  const [freq, setFreq] = useState(FREQUENCIES[0]);

  const P = Number(principal), R = Number(rate), T = Number(years);
  const maturity = P * Math.pow(1 + (R / 100) / freq.n, freq.n * T);
  const interest = maturity - P;

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-3">
        <label className="text-sm block">Deposit amount (₹)<input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Interest rate (% per year)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Tenure (years)<input type="number" value={years} onChange={(e) => setYears(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <div>
          <p className="text-sm">Compounding frequency</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (<button key={f.label} onClick={() => setFreq(f)} className={`rounded-full border border-border px-3 py-1.5 text-sm ${freq.label === f.label ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{f.label}</button>))}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="rounded-control border border-border bg-primary/10 p-3"><p className="text-xs text-muted">Maturity Value</p><p className="text-2xl font-bold text-primary">₹{inr(maturity)}</p></div>
        <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Interest Earned</p><p className="text-lg font-semibold text-text">₹{inr(interest)}</p></div>
      </div>
    </div>
  );
}
