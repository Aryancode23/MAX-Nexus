"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/Button";

export function IfscLookupTool() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function lookup() {
    setStatus("loading");
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code.toUpperCase()}`);
      if (!res.ok) throw new Error("not found");
      setResult(await res.json());
      setStatus("idle");
    } catch {
      setResult(null);
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-xs text-muted">Data from Razorpay's public IFSC API — this is a lookup tool, not an official banking service.</p>
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SBIN0001234" className="focus-ring flex-1 rounded-control border border-border bg-surface px-3 py-2 text-sm uppercase" />
        <Button onClick={lookup}><Search size={14} /> Lookup</Button>
      </div>
      {status === "error" && <p className="text-sm text-danger">Couldn't find that IFSC code. Check it and try again.</p>}
      {result && (
        <div className="space-y-1 rounded-control border border-border bg-surface p-4 text-sm">
          <p className="font-semibold text-text">{result.BANK}</p>
          <p className="text-muted">{result.BRANCH}</p>
          <p className="text-muted">{result.ADDRESS}</p>
          <p className="text-muted">{result.CITY}, {result.STATE}</p>
        </div>
      )}
    </div>
  );
}
