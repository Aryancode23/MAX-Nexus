"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/Button";

export function PinCodeLookupTool() {
  const [pin, setPin] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function lookup() {
    if (!/^\d{6}$/.test(pin)) { setStatus("error"); return; }
    setStatus("loading");
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      const data = await res.json();
      if (data?.[0]?.Status === "Success") { setResults(data[0].PostOffice); setStatus("idle"); }
      else { setResults([]); setStatus("idle"); }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <p className="text-xs text-muted">Data from India Post's public PIN code API — this is a lookup tool, not an official government service.</p>
      <div className="flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value)} maxLength={6} placeholder="e.g. 226001" className="focus-ring flex-1 rounded-control border border-border bg-surface px-3 py-2 text-sm" />
        <Button onClick={lookup}><Search size={14} /> Lookup</Button>
      </div>
      {status === "error" && <p className="text-sm text-danger">Couldn't find that PIN code. Check it and try again.</p>}
      {results && results.length > 0 && (
        <ul className="space-y-2">
          {results.map((po, i) => (
            <li key={i} className="rounded-control border border-border bg-surface p-3 text-sm">
              <p className="font-medium text-text">{po.Name}</p>
              <p className="text-muted">{po.District}, {po.State} · {po.BranchType}</p>
            </li>
          ))}
        </ul>
      )}
      {results && results.length === 0 && <p className="text-sm text-muted">No post offices found for this PIN code.</p>}
    </div>
  );
}
