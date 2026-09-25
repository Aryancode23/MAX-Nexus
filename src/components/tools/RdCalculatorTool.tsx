"use client";
import { useState } from "react";

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }

export function RdCalculatorTool() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("6.5");
  const [months, setMonths] = useState("24");

  const R = Number(monthly), r = Number(rate), n = Number(months);
  // Widely used approximate RD maturity formula (matches most bank illustrations):
  // treats each installment as earning simple interest for its remaining months.
  const totalDeposited = R * n;
  const interest = R * (n * (n + 1) / 2) * (r / 1200);
  const maturity = totalDeposited + interest;

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-3">
        <label className="text-sm block">Monthly deposit (₹)<input type="number" value={monthly} onChange={(e) => setMonthly(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Interest rate (% per year)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Tenure (months)<input type="number" value={months} onChange={(e) => setMonths(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      </div>
      <div className="space-y-3">
        <div className="rounded-control border border-border bg-primary/10 p-3"><p className="text-xs text-muted">Maturity Value (approx.)</p><p className="text-2xl font-bold text-primary">₹{inr(maturity)}</p></div>
        <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Total Deposited</p><p className="text-lg font-semibold text-text">₹{inr(totalDeposited)}</p></div>
        <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Interest Earned (approx.)</p><p className="text-lg font-semibold text-text">₹{inr(interest)}</p></div>
      </div>
      <p className="text-xs text-muted">This uses the standard approximation banks show in RD illustrations. Your bank's exact compounding method may give a slightly different figure — check your passbook/statement for the exact amount.</p>
    </div>
  );
}
