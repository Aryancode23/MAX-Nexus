"use client";
import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/Button";

const CURRENCIES = ["INR", "USD", "EUR", "GBP", "AED", "SGD", "AUD", "JPY", "CAD"];

export function CurrencyConverterTool() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");
  const [result, setResult] = useState<{ rate: number; converted: number } | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function convert() {
    setStatus("loading");
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${from}`);
      const data = await res.json();
      if (data.result !== "success") throw new Error("failed");
      const rate = data.rates[to];
      setResult({ rate, converted: rate * Number(amount) });
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-md space-y-4">
      <p className="text-xs text-muted">Exchange rates from a free public rate API (open.er-api.com) — for reference only, not a live trading rate.</p>
      <label className="block text-sm">Amount<input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      <div className="flex items-end gap-2">
        <label className="flex-1 text-sm">From
          <select value={from} onChange={(e) => setFrom(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <button onClick={() => { setFrom(to); setTo(from); }} className="mb-2 rounded-control border border-border p-2 text-muted hover:text-text"><ArrowLeftRight size={16} /></button>
        <label className="flex-1 text-sm">To
          <select value={to} onChange={(e) => setTo(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm">
            {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>
      <Button onClick={convert} disabled={status === "loading"}>{status === "loading" ? "Converting…" : "Convert"}</Button>
      {status === "error" && <p className="text-sm text-danger">Couldn't fetch exchange rates right now. Try again shortly.</p>}
      {result && (
        <div className="rounded-card border border-border bg-primary/10 p-4 text-center">
          <p className="text-2xl font-bold text-primary">{result.converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} {to}</p>
          <p className="text-xs text-muted">1 {from} = {result.rate.toFixed(4)} {to}</p>
        </div>
      )}
    </div>
  );
}
