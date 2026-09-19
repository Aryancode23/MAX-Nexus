"use client";
import { useState } from "react";

export function PercentageCalculatorTool() {
  const [x, setX] = useState("10");
  const [y, setY] = useState("200");

  const percentOfY = (Number(x) / 100) * Number(y);
  const xIsPercentOfY = Number(y) !== 0 ? (Number(x) / Number(y)) * 100 : 0;
  const change = Number(x) !== 0 ? ((Number(y) - Number(x)) / Number(x)) * 100 : 0;

  return (
    <div className="max-w-md space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">Value A<input value={x} onChange={(e) => setX(e.target.value)} type="number" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
        <label className="text-sm">Value B<input value={y} onChange={(e) => setY(e.target.value)} type="number" className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      </div>
      <div className="space-y-3">
        <Result label={`${x}% of ${y}`} value={percentOfY.toFixed(2)} />
        <Result label={`${x} is what % of ${y}`} value={`${xIsPercentOfY.toFixed(2)}%`} />
        <Result label={`% change from ${x} to ${y}`} value={`${change.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-control border border-border bg-surface p-3 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-semibold text-text">{value}</span>
    </div>
  );
}
