"use client";
import { useState } from "react";

function inr(n: number) { return n.toLocaleString("en-IN", { maximumFractionDigits: 0 }); }

export function LoanTenureCalculatorTool() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("9.5");
  const [emi, setEmi] = useState("12000");

  const P = Number(principal), annualRate = Number(rate), E = Number(emi);
  const r = annualRate / 12 / 100;
  const monthlyInterest = P * r;
  const valid = E > monthlyInterest;
  const n = valid ? Math.log(E / (E - monthlyInterest)) / Math.log(1 + r) : null;

  return (
    <div className="max-w-md space-y-6">
      <div className="space-y-3">
        <label className="text-sm block">Loan amount (₹)<input type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Annual interest rate (%)<input type="number" value={rate} onChange={(e) => setRate(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm block">Monthly EMI you can pay (₹)<input type="number" value={emi} onChange={(e) => setEmi(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      </div>
      {valid && n !== null ? (
        <div className="space-y-3">
          <div className="rounded-control border border-border bg-primary/10 p-3"><p className="text-xs text-muted">Estimated Tenure</p><p className="text-2xl font-bold text-primary">{Math.ceil(n)} months (~{(n / 12).toFixed(1)} years)</p></div>
          <div className="rounded-control border border-border bg-surface p-3"><p className="text-xs text-muted">Total payable (approx.)</p><p className="text-lg font-semibold text-text">₹{inr(E * Math.ceil(n))}</p></div>
        </div>
      ) : (
        <p className="text-sm text-danger">This EMI is too low to cover the monthly interest (₹{inr(monthlyInterest)}) — the loan would never be paid off. Increase the EMI.</p>
      )}
    </div>
  );
}
