"use client";
import { useState } from "react";

export function AgeCalculatorTool() {
  const [dob, setDob] = useState("");
  const [asOf, setAsOf] = useState(new Date().toISOString().slice(0, 10));

  let result: { years: number; months: number; days: number } | null = null;
  if (dob) {
    const start = new Date(dob);
    const end = new Date(asOf);
    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();
    if (days < 0) { months -= 1; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years -= 1; months += 12; }
    result = { years, months, days };
  }

  return (
    <div className="max-w-md space-y-4">
      <label className="block text-sm">Date of birth<input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      <label className="block text-sm">As of date<input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      {result && (
        <div className="rounded-card border border-border bg-surface p-4 text-center">
          <p className="text-2xl font-bold text-text">{result.years}y {result.months}m {result.days}d</p>
        </div>
      )}
    </div>
  );
}
