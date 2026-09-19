"use client";
import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/Button";

const FORMATS = ["CODE128", "EAN13", "UPC", "CODE39"];

export function BarcodeGeneratorTool() {
  const [text, setText] = useState("123456789012");
  const [format, setFormat] = useState("CODE128");
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!canvasRef.current || !text) return;
      try {
        const JsBarcode = (await import("jsbarcode")).default;
        if (cancelled) return;
        JsBarcode(canvasRef.current, text, { format, width: 2, height: 80, displayValue: true });
        setError(null);
      } catch {
        if (!cancelled) setError("Couldn't generate a barcode for this value with the selected format (check the length/characters required by that format).");
      }
    }
    render();
    return () => { cancelled = true; };
  }, [text, format]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "barcode.png";
    a.click();
  }

  return (
    <div className="max-w-lg space-y-4">
      <label className="block text-sm">Value<input value={text} onChange={(e) => setText(e.target.value)} className="focus-ring mt-1 w-full rounded-control border border-border bg-surface px-3 py-2 text-sm" /></label>
      <div>
        <p className="text-sm">Format</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {FORMATS.map((f) => (<button key={f} onClick={() => setFormat(f)} className={`rounded-full border border-border px-3 py-1.5 text-sm ${format === f ? "bg-primary text-primary-foreground" : "bg-surface text-muted"}`}>{f}</button>))}
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
      <div className="rounded-card border border-border bg-white p-4"><canvas ref={canvasRef} /></div>
      <Button variant="secondary" onClick={download}><Download size={16} /> Download PNG</Button>
    </div>
  );
}
