"use client";
import { useState } from "react";
import { Copy, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";

const SETS: Record<string, string> = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()_-+=?",
};

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ lower: true, upper: true, digits: true, symbols: false });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    const pool = Object.entries(opts).filter(([, v]) => v).map(([k]) => SETS[k]).join("");
    if (!pool) return;
    const bytes = new Uint32Array(length);
    crypto.getRandomValues(bytes);
    setPassword(Array.from(bytes, (b) => pool[b % pool.length]).join(""));
  }

  function copy() {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-md space-y-5">
      <div className="flex items-center gap-2 rounded-control border border-border bg-surface p-3">
        <code className="flex-1 truncate text-sm">{password || "Click generate…"}</code>
        <button onClick={copy} className="text-muted hover:text-text">{copied ? <Check size={16} /> : <Copy size={16} />}</button>
      </div>
      <label className="block text-sm">Length: {length}<input type="range" min={6} max={32} value={length} onChange={(e) => setLength(Number(e.target.value))} className="mt-1 w-full" /></label>
      <div className="flex flex-wrap gap-4 text-sm">
        {Object.keys(opts).map((k) => (
          <label key={k} className="flex items-center gap-2 capitalize">
            <input type="checkbox" checked={(opts as any)[k]} onChange={(e) => setOpts({ ...opts, [k]: e.target.checked })} /> {k}
          </label>
        ))}
      </div>
      <Button onClick={generate} className="w-full"><RefreshCw size={14} /> Generate</Button>
    </div>
  );
}
