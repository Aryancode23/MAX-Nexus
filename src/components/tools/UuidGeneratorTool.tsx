"use client";
import { useState } from "react";
import { Copy, Plus } from "lucide-react";
import { Button } from "@/components/Button";

export function UuidGeneratorTool() {
  const [uuids, setUuids] = useState<string[]>([crypto.randomUUID()]);

  function copy(u: string) { navigator.clipboard.writeText(u); }

  return (
    <div className="max-w-lg space-y-4">
      <Button onClick={() => setUuids([crypto.randomUUID(), ...uuids])}><Plus size={14} /> Generate new</Button>
      <ul className="space-y-2">
        {uuids.map((u, i) => (
          <li key={i} className="flex items-center justify-between rounded-control border border-border bg-surface px-3 py-2 text-sm">
            <code>{u}</code>
            <button onClick={() => copy(u)} className="text-muted hover:text-text"><Copy size={14} /></button>
          </li>
        ))}
      </ul>
    </div>
  );
}
