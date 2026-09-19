"use client";
import { useState } from "react";

function inr(n: number) {
  return n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

export function EmiCalculatorTool() {
  const [principal, setPrincipal] = useState("500000");
  const [rate, setRate] = useState("9.5");
  const [years, setYears] = useState("5");

  const P = Number(principal), annualRate = Number(rate), n = Number(years) * 12;
  const r = annualRate / 12 / 100;
  const emi = r > 0 ? (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : P / n;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - P;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <Field label="Loan amount (₹)" value={principal} onChange={setPrincipal} />
        <Field label="Annual interest rate (%)" value={rate} onChange={setRate} />
        <Field label="Loan tenure (years)" value={years} onChange={setYears} />
      </div>
      <div className="space-y-3">
        <Result label="Monthly EMI" value={`₹${inr(emi)}`} big />
        <Result label="Total interest payable" value={`₹${inr(totalInterest)}`} />
        <Result label="Total amount payable" value={`₹${inr(totalPayment)}`} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      {label}
      <input type="number" value={value} onChange={(e) => onChange(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" />
    </label>
  );
}

function Result({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className={`rounded-control border border-border p-3 ${big ? "bg-primary/10" : "bg-surface"}`}>
      <p className="text-xs text-muted">{label}</p>
      <p className={big ? "text-2xl font-bold text-primary" : "text-lg font-semibold text-text"}>{value}</p>
    </div>
  );
}
